import classNames from "classnames";
import styles from "./index.module.less";
import { MainViewer, ShareScene, SideViewer } from "@/renderer";
import BoxSvg from "@/assets/box.svg?react";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Color, Vector3 } from "three";
import { Box3D } from "@/renderer/objects";

const Home = () => {
  const initialized = useRef(false);

  const mainViewerRef = useRef<HTMLDivElement>(null);
  const overheadViewerRef = useRef<HTMLDivElement>(null);
  const sideViewerRef = useRef<HTMLDivElement>(null);
  const rearViewerRef = useRef<HTMLDivElement>(null);

  const mainViewer = useRef<MainViewer>();
  const overheadViewer = useRef<SideViewer>();
  const sideViewer = useRef<SideViewer>();
  const rearViewer = useRef<SideViewer>();

  const shareScene = new ShareScene();

  const [TOOLS] = useState([
    {
      name: "Create",
      icon: BoxSvg,
      onClick: () => {
        console.log("Create");
        mainViewer.current?.getAction("OrbitControls")?.toggle();
        mainViewer.current?.getAction("Create")?.toggle();
      },
    },
  ]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const up = new Vector3(0, 0, 1);
    mainViewer.current = new MainViewer(mainViewerRef.current!, shareScene, {
      up,
    });
    mainViewer.current.disableAction("Create");

    overheadViewer.current = new SideViewer(
      overheadViewerRef.current!,
      shareScene,
      { up, axis: "z" },
    );
    sideViewer.current = new SideViewer(sideViewerRef.current!, shareScene, {
      up,
      axis: "y",
    });
    rearViewer.current = new SideViewer(rearViewerRef.current!, shareScene, {
      up,
      axis: "x",
    });

    shareScene
      .loadPointCloud(
        "https://basicai-prod-app-dataset.s3.us-west-2.amazonaws.com/team_1710563/dataset_1249533/data_44227652/binary_08a70e788ee5457f82f5d2fe95d34f5f.pcd",
      )
      .finally(() => {
        console.log(shareScene.points);

        const gui = new GUI();
        gui.domElement.style.left = "40px";
        gui.add(shareScene.points.material, "size", 1, 10);
        gui.add(shareScene.points.material, "opacity", 0, 1, 0.01);
        const colorFolder = gui.addFolder("color");
        const preControllers: unknown[] = [];
        colorFolder
          .add(shareScene.points.material, "colorMode", {
            默认: 0,
            纯色: 1,
            渐变: 2,
          })
          .name("颜色模式")
          .onChange((value) => {
            preControllers.forEach((item) => (item as GUI).destroy());
            preControllers.length = 0;
            if (value === 0) {
              const { geometry } = shareScene.points;
              const positionAttr =
                geometry.getAttribute("color") ||
                geometry.getAttribute("position");
              geometry.setAttribute("color", positionAttr);
            } else if (value === 1) {
              const sColorController = colorFolder.addColor(
                shareScene.points.material,
                "sColor",
              );
              preControllers.push(sColorController);
            } else if (value === 2) {
              // use_gradient
              shareScene.points.material.gradient = [
                { value: 0, color: new Color(0x99ccff) },
                { value: 0.2, color: new Color(0x6699ff) },
                { value: 0.4, color: new Color(0x3366ff) },
                { value: 0.6, color: new Color(0x0033ff) },
                { value: 0.8, color: new Color(0x0000cc) },
                { value: 1, color: new Color(0x000099) },
              ];

              shareScene.points.material.gradient.forEach((item) => {
                const colorController = colorFolder
                  .addColor(item, "color")
                  .name(`gradient_${item.value}`);
                preControllers.push(colorController);
              });

              const gradientRange = {
                min: 0,
                max: 5,
              };
              shareScene.points.material.gradientRange = [
                gradientRange.min,
                gradientRange.max,
              ];
              const gradientRange_1 = colorFolder
                .add(gradientRange, "min", -10, gradientRange.max)
                .name("gradientRange_1")
                .onChange(() => {
                  if (gradientRange_1._max !== gradientRange.max) {
                    gradientRange_1.max(gradientRange.max);
                    gradientRange_1.setValue(gradientRange_1.getValue());
                  }
                  if (gradientRange_2._min !== gradientRange.min) {
                    gradientRange_2.min(gradientRange.min);
                    gradientRange_2.setValue(gradientRange_2.getValue());
                  }
                  shareScene.points.material.gradientRange = [
                    gradientRange.min,
                    gradientRange.max,
                  ];
                });
              const gradientRange_2 = colorFolder
                .add(gradientRange, "max", gradientRange.min, 10)
                .name("gradientRange_2")
                .onChange(() => {
                  if (gradientRange_1._max !== gradientRange.max) {
                    gradientRange_1.max(gradientRange.max);
                    gradientRange_1.setValue(gradientRange_1.getValue());
                  }
                  if (gradientRange_2._min !== gradientRange.min) {
                    gradientRange_2.min(gradientRange.min);
                    gradientRange_2.setValue(gradientRange_2.getValue());
                  }

                  shareScene.points.material.gradientRange = [
                    gradientRange.min,
                    gradientRange.max,
                  ];
                });
              preControllers.push(gradientRange_1, gradientRange_2);
            }
          })
          .load(2);
        gui.onChange(() => {
          mainViewer.current?.render();
          overheadViewer.current?.render();
          sideViewer.current?.render();
          rearViewer.current?.render();
        });
        gui.onFinishChange(() => {
          mainViewer.current?.render();
          overheadViewer.current?.render();
          sideViewer.current?.render();
          rearViewer.current?.render();
        });

        mainViewer.current?.render();
        overheadViewer.current?.render();
        sideViewer.current?.render();
        rearViewer.current?.render();

        // DEBUG
        const box3D_1 = new Box3D();
        box3D_1.position.set(10, 20, 0);
        box3D_1.rotation.set(0, 0, Math.PI / 3);
        box3D_1.scale.setScalar(10);
        box3D_1.material.color.setHex(0xff0000);

        const box3D_2 = new Box3D();
        box3D_2.scale.setScalar(10);
        box3D_2.material.color.setHex(0x00ff00);

        shareScene.scene.add(box3D_1, box3D_2);
        shareScene.select(box3D_1);

        const boxFolder = gui.addFolder("box3D_1");
        boxFolder.add(box3D_1.position, "x", -20, 20, 0.01).name("x");
        boxFolder.add(box3D_1.position, "y", -20, 20, 0.01).name("y");
        boxFolder.add(box3D_1.position, "z", -20, 20, 0.01).name("z");
        boxFolder.onChange(() => {
          mainViewer.current?.focusTarget();
          overheadViewer.current?.focusTarget();
          sideViewer.current?.focusTarget();
          rearViewer.current?.focusTarget();
        });
      });
  }, []);

  return (
    <div className={classNames(styles["page-wrapper"])}>
      <div className={classNames(styles["tools-wrapper"])}>
        {TOOLS.map((tool) => (
          <div
            key={tool.name}
            className={classNames(styles["tool-item"])}
            onClick={tool.onClick}
          >
            <tool.icon />
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
      <div
        className={classNames(styles["main-viewer"])}
        ref={mainViewerRef}
      ></div>
      <div className={classNames(styles["side-viewer"])}>
        <div ref={overheadViewerRef}></div>
        <div ref={sideViewerRef}></div>
        <div ref={rearViewerRef}></div>
      </div>
    </div>
  );
};

export default Home;
