import {
  Box3,
  type BufferGeometry,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";

export interface InstanceAttributes<T extends EmptyObject = EmptyObject> {
  id: string;
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
  color?: Color;
  userData?: T;
}

const _reusableMatrix4 = new Matrix4();
const _zeroScaleMatrix = new Matrix4().makeScale(0, 0, 0);
const _reusableVector3 = new Vector3();
const _reusableBox3 = new Box3();

export default class InstancedMeshManager<T extends EmptyObject = EmptyObject> {
  /** 实例化网格对象 */
  mesh: InstancedMesh<BufferGeometry, Material>;
  /** 最大实例容量 */
  get capacity(): number {
    return this._capacity;
  }
  private _capacity: number;

  /** 实例数据存储 (id -> InstanceAttributes) */
  private readonly _instances = new Map<string, InstanceAttributes<T>>();

  /** 实例索引映射 (id -> index) */
  private readonly _instanceIndices = new Map<string, number>();

  /** 空闲索引池 */
  private readonly _freeIndices: number[] = [];
  /** 当前活跃实例数量 */
  get instanceCount(): number {
    return this._instanceIndices.size;
  }

  /** 可用实例槽位数量 */
  get availableSlots(): number {
    return this.capacity - this.instanceCount;
  }

  constructor(geometry: BufferGeometry, material: Material, capacity: number) {
    this.mesh = new InstancedMesh(geometry, material, capacity);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this._capacity = this.mesh.count;
  }
  /**
   * 添加或更新实例
   * @param instances 要添加的实例数据数组
   * @returns 当前管理器实例
   */
  upsert(instances: InstanceAttributes<T>[]): this {
    if (instances.length > this.availableSlots) {
      this._expandCapacity(Math.max(Math.ceil(this.capacity * 1.5), this.instanceCount + instances.length));
    }

    instances.forEach((instance) => {
      const existingIndex = this._instanceIndices.get(instance.id);
      const index = existingIndex ?? this._getNextAvailableIndex();

      this._updateInstance(index, instance);

      if (!existingIndex) this._instanceIndices.set(instance.id, index);
      this._instances.set(instance.id, instance);
    });

    this._markAttributesDirty();
    return this;
  }
  /**
   * 移除实例
   * @param instanceIds 要移除的实例ID数组
   * @returns 当前管理器实例
   */
  remove(instanceIds: string[]): this {
    instanceIds.forEach((id) => {
      const index = this._instanceIndices.get(id);
      if (index === undefined) return;

      this.mesh.setMatrixAt(index, _zeroScaleMatrix);

      this._freeIndices.push(index);
      this._instances.delete(id);
      this._instanceIndices.delete(id);
    });
    this._markAttributesDirty();
    return this;
  }
  /**
   * 清空所有实例
   * @returns 当前管理器实例
   */
  clear(): this {
    this.remove(Array.from(this._instances.keys()));
    return this;
  }
  /**
   * 通过实例ID获取实例数据
   * @param instanceId 实例ID
   * @returns {Readonly<InstanceAttributes<T>> | undefined} 实例数据或null
   */
  getInstance(instanceId: string): Readonly<InstanceAttributes<T>> | undefined {
    return this._instances.get(instanceId);
  }
  /**
   * 获取所有实例数据
   * @returns {Readonly<InstanceAttributes<T>>[]} 所有实例数据
   */
  getAllInstance(): Readonly<InstanceAttributes<T>>[] {
    return Array.from(this._instances.values());
  }
  /**
   * 通过渲染实例ID获取业务实例ID
   * @param renderInstanceId 渲染实例ID
   * @returns 对应的业务实例ID或undefined
   */
  getInstanceIdFromRenderId(renderInstanceId: number): string | undefined {
    // 线性查找，因为这是低频操作
    for (const [id, index] of this._instanceIndices) {
      if (index === renderInstanceId) return id;
    }
    return undefined;
  }
  /**
   * 获取实例对应的虚拟网格对象
   * @param instanceId 实例ID
   * @returns {Mesh} 虚拟网格对象
   * @deprecated 请改用 {@link InstancedMeshManager.getWorldMatrix} {@link InstancedMeshManager.getWorldPosition} {@link InstancedMeshManager.getWorldBox}
   */
  getVirtualMesh(instanceId: string): Mesh {
    const instance = this._instances.get(instanceId);
    if (instance === undefined) throw new Error(`Instance ${instanceId} not found`);

    const { position, quaternion, scale } = instance;
    const mesh = new Mesh(this.mesh.geometry, this.mesh.material);
    mesh.uuid = instanceId;
    mesh.position.copy(position);
    mesh.quaternion.copy(quaternion);
    mesh.scale.copy(scale);
    mesh.updateMatrix();
    mesh.updateMatrixWorld();
    return mesh;
  }
  /**
   * 获取实例的世界矩阵
   * @param instanceId 实例ID
   * @returns {Matrix4} 实例世界矩阵
   */
  getWorldMatrix(instanceId: string): Matrix4 {
    const index = this._instanceIndices.get(instanceId);
    if (index === undefined) throw new Error(`Instance ${instanceId} not found`);

    this.mesh.getMatrixAt(index, _reusableMatrix4);
    if (this.mesh.matrixWorldNeedsUpdate) this.mesh.updateWorldMatrix(true, false);
    return _reusableMatrix4.multiplyMatrices(this.mesh.matrixWorld, _reusableMatrix4);
  }
  /**
   * 获取实例的世界坐标
   * @param instanceId 实例ID
   * @returns {Vector3} 实例世界坐标
   */
  getWorldPosition(instanceId: string): Vector3 {
    const worldMatrix = this.getWorldMatrix(instanceId);
    return _reusableVector3.setFromMatrixPosition(worldMatrix);
  }
  /**
   * 获取实例的世界包围盒
   * @param instanceId 实例ID
   * @returns {Box3} 实例世界包围盒
   */
  getWorldBox(instanceId: string): Box3 {
    const worldMatrix = this.getWorldMatrix(instanceId);
    if (!this.mesh.geometry.boundingBox) this.mesh.geometry.computeBoundingBox();
    _reusableBox3.copy(this.mesh.geometry.boundingBox!);
    _reusableBox3.applyMatrix4(worldMatrix);
    return _reusableBox3;
  }
  /**
   * 序列号
   */
  serialize() {
    return {
      capacity: this.capacity,
      instances: this.getAllInstance(),
    };
  }
  /**
   * 反序列化
   * @param data 反序列化数据
   * @returns 当前管理器实例
   */
  deserialize(data: { capacity: number; instances: InstanceAttributes<T>[] }): this {
    this.clear();
    this._capacity = 0;
    this._expandCapacity(data.capacity);
    this.upsert(data.instances);
    return this;
  }

  /**
   * 处置资源
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((material) => material.dispose());
    } else {
      this.mesh.material.dispose();
    }
    this.mesh.dispose();

    this.clear();
  }
  /**
   * 扩容实例存储
   * @param newCapacity 新的容量大小
   */
  private _expandCapacity(newCapacity: number): void {
    if (newCapacity <= this.capacity) return;

    const newMesh = new InstancedMesh(this.mesh.geometry, this.mesh.material, newCapacity);
    this._capacity = newCapacity;
    // 迁移现有数据
    this._instanceIndices.forEach((index, id) => {
      const instance = this._instances.get(id)!;
      this._updateInstance(index, instance, newMesh);
    });
    // 替换原网格
    this.mesh.parent?.add(newMesh);
    this.mesh.parent?.remove(this.mesh);
    this.mesh.dispose();
    this.mesh = newMesh;
  }
  /**
   * 获取下一个可用索引
   * @returns 可用索引
   */
  private _getNextAvailableIndex(): number {
    return this._freeIndices.pop() ?? this.instanceCount;
  }

  /**
   * 更新实例数据
   * @param index 实例索引
   * @param instance 实例数据
   * @param targetMesh 目标网格(默认为当前网格)
   */
  private _updateInstance(index: number, instance: InstanceAttributes<T>, targetMesh: InstancedMesh = this.mesh): void {
    _reusableMatrix4.compose(instance.position, instance.quaternion, instance.scale);
    targetMesh.setMatrixAt(index, _reusableMatrix4);

    if (instance.color) {
      targetMesh.setColorAt(index, instance.color);
    }
  }

  /**
   * 标记实例属性需要更新
   */
  private _markAttributesDirty(): void {
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }
}
