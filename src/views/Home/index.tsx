import classNames from "classnames";
import { Color, MathUtils, Vector3 } from "three";

import BoxSvg from "@/assets/box.svg?react";
import { OrthographicViewer, PerspectiveViewer } from "@/renderer";
import { createBox3D } from "@/renderer/utils";
import { useShareContext } from "@/stores/ShareContext";

import styles from "./index.module.less";

const Home = () => {
  const { shareScene } = useShareContext();

  const mainViewerRef = useRef<HTMLDivElement>(null);
  const overheadViewerRef = useRef<HTMLDivElement>(null);
  const sideViewerRef = useRef<HTMLDivElement>(null);
  const rearViewerRef = useRef<HTMLDivElement>(null);

  const mainViewer = useRef<PerspectiveViewer>(null);
  const overhead = useRef<OrthographicViewer>(null);
  const side = useRef<OrthographicViewer>(null);
  const rear = useRef<OrthographicViewer>(null);

  const [TOOLS] = useState([
    {
      name: "Create",
      icon: BoxSvg,
      onClick: () => {
        console.log("Create");
      },
    },
  ]);

  useEffect(() => {
    shareScene.loadPointCloud(
      "https://basicai-prod-app-dataset.s3.us-west-2.amazonaws.com/team_1711395/dataset_1255224/data_45200230/binary_c97769fad9ea418b96942a42799b008f.pcd",
    );
    mainViewer.current = new PerspectiveViewer(mainViewerRef.current!, shareScene, {
      name: "main",
    });
    overhead.current = new OrthographicViewer(overheadViewerRef.current!, shareScene, {
      axis: "z",
      name: "overhead",
    });
    side.current = new OrthographicViewer(sideViewerRef.current!, shareScene, {
      axis: "y",
      name: "side",
    });
    rear.current = new OrthographicViewer(rearViewerRef.current!, shareScene, {
      axis: "-x",
      name: "rear",
    });
    const randomVector2 = (min: number, max: number): Vector3 => {
      return new Vector3(
        MathUtils.randFloat(min, max),
        MathUtils.randFloat(min, max),
        0, // z 固定为 0
      );
    };

    const randomSize = (): Vector3 => {
      return new Vector3(
        MathUtils.randFloat(0.5, 3),
        MathUtils.randFloat(0.5, 3),
        MathUtils.randFloat(0.5, 3), // z 尺寸可以随意
      );
    };

    const randomZRotation = (): Vector3 => {
      return new Vector3(0, 0, MathUtils.randFloat(0, Math.PI * 2));
    };

    const randomColor = (): Color => {
      return new Color(Math.random(), Math.random(), Math.random());
    };

    const boxes = Array.from({ length: 1000 }, () => {
      const center = randomVector2(-200, 200); // xy 随机，z=0
      const size = randomSize(); // 任意 size
      const rotation = randomZRotation(); // 只绕 z 轴旋转
      const color = randomColor();
      return createBox3D(center, size, rotation, color);
    });
    shareScene.addObject(...boxes);

    return () => {
      mainViewer.current?.dispose();
      overhead.current?.dispose();
      side.current?.dispose();
      rear.current?.dispose();
      shareScene.removeObject(...shareScene.getAnnotations3D());
    };
  }, []);

  return (
    <div className={classNames(styles["page-wrapper"])}>
      <div className={classNames(styles["tools-wrapper"])}>
        {TOOLS.map((tool) => (
          <div key={tool.name} className={classNames(styles["tool-item"])} onClick={tool.onClick}>
            <tool.icon />
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
      <div className={classNames(styles["main-viewer"])} ref={mainViewerRef}></div>
      <div className={classNames(styles["side-viewer"])}>
        <div ref={overheadViewerRef}></div>
        <div ref={sideViewerRef}></div>
        <div ref={rearViewerRef}></div>
      </div>
    </div>
  );
};

export default Home;
