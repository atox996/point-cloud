import classNames from "classnames";
import styles from "./index.module.less";
import { MainViewer, PointCloud, SideViewer } from "@/renderer";
import BoxSvg from "@/assets/box.svg?react";
import { ActionName } from "@/renderer/actions";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Color } from "three";

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

  const pointCloud = new PointCloud();

  const [TOOLS] = useState([
    {
      name: "Create",
      icon: BoxSvg,
      onClick: () => {
        console.log("Create");
        mainViewer.current?.getAction(ActionName.OrbitControls)?.toggle();
        mainViewer.current?.getAction(ActionName.Create)?.toggle();
      },
    },
  ]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const up = { x: 0, y: 0, z: 1 };
    mainViewer.current = new MainViewer(mainViewerRef.current!, pointCloud, {
      up,
    });
    mainViewer.current.disableAction(ActionName.Create);

    overheadViewer.current = new SideViewer(
      overheadViewerRef.current!,
      pointCloud,
      { up, axis: "z" },
    );
    sideViewer.current = new SideViewer(sideViewerRef.current!, pointCloud, {
      up,
      axis: "y",
    });
    rearViewer.current = new SideViewer(rearViewerRef.current!, pointCloud, {
      up,
      axis: "x",
    });

    pointCloud
      .load(
        "https://basicai-prod-app-dataset.s3.us-west-2.amazonaws.com/team_1710563/dataset_1249533/data_44227652/binary_08a70e788ee5457f82f5d2fe95d34f5f.pcd",
      )
      .finally(() => {
        console.log(pointCloud.points);

        const gui = new GUI();
        gui.domElement.style.left = "40px";
        gui.add(pointCloud.points.material, "size", 1, 10);
        gui.add(pointCloud.points.material, "opacity", 0, 1, 0.01);
        const colorParams: {
          colorMode: "default" | "sColor" | "gradient";
        } = {
          colorMode: "gradient",
        };
        const preControllers: unknown[] = [];
        const updateColorMode = (value: (typeof colorParams)["colorMode"]) => {
          preControllers.forEach((item) => (item as GUI).destroy());
          preControllers.length = 0;
          if (value === "default") {
            const { geometry } = pointCloud.points;
            const positionAttr =
              geometry.getAttribute("color") ||
              geometry.getAttribute("position");
            geometry.setAttribute("color", positionAttr);
            pointCloud.points.material.sColor = null;
          } else if (value === "sColor") {
            // use_color
            pointCloud.points.material.sColor = new Color(0xffffff);
            const sColorController = gui.addColor(
              pointCloud.points.material,
              "sColor",
            );
            preControllers.push(sColorController);
          } else if (value === "gradient") {
            // use_gradient
            pointCloud.points.material.gradient = [
              { value: 0, color: new Color(0x99ccff) },
              { value: 0.2, color: new Color(0x6699ff) },
              { value: 0.4, color: new Color(0x3366ff) },
              { value: 0.6, color: new Color(0x0033ff) },
              { value: 0.8, color: new Color(0x0000cc) },
              { value: 1, color: new Color(0x000099) },
            ];

            pointCloud.points.material.gradient.forEach((item) => {
              const colorController = gui
                .addColor(item, "color")
                .name(`gradient_${item.value}`);
              preControllers.push(colorController);
            });

            const gradientRange = {
              min: 0,
              max: 5,
            };
            pointCloud.points.material.gradientRange = [
              gradientRange.min,
              gradientRange.max,
            ];
            const gradientRange_1 = gui
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
                pointCloud.points.material.gradientRange = [
                  gradientRange.min,
                  gradientRange.max,
                ];
              });
            const gradientRange_2 = gui
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

                pointCloud.points.material.gradientRange = [
                  gradientRange.min,
                  gradientRange.max,
                ];
              });
            preControllers.push(gradientRange_1, gradientRange_2);
          }
        };
        gui
          .add(colorParams, "colorMode", {
            默认: "default",
            纯色: "sColor",
            渐变: "gradient",
          })
          .name("颜色模式")
          .onChange(updateColorMode);
        updateColorMode(colorParams.colorMode);
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
        pointCloud.dispatchEvent({
          type: "select",
          selection: [pointCloud.trimBox],
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
