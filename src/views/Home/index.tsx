import classNames from "classnames";
import styles from "./index.module.less";
import { MainViewer, PointCloud, SideViewer } from "@/renderer";
import BoxSvg from "@/assets/box.svg?react";
import { ActionName } from "@/renderer/actions";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

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

    mainViewer.current = new MainViewer(mainViewerRef.current!, pointCloud);
    mainViewer.current.disableAction(ActionName.Create);

    overheadViewer.current = new SideViewer(
      overheadViewerRef.current!,
      pointCloud,
      { axis: "z" },
    );
    sideViewer.current = new SideViewer(sideViewerRef.current!, pointCloud, {
      axis: "y",
    });
    rearViewer.current = new SideViewer(rearViewerRef.current!, pointCloud, {
      axis: "x",
    });

    pointCloud
      .load(
        "https://basicai-prod-app-dataset.s3.us-west-2.amazonaws.com/team_1710563/dataset_1249533/data_44227652/binary_08a70e788ee5457f82f5d2fe95d34f5f.pcd",
      )
      .finally(() => {
        console.log(pointCloud.points);

        const gui = new GUI();
        gui.add(pointCloud.points.material, "size", 1, 10);
        gui.add(pointCloud.points.material, "opacity", 0, 1, 0.01);

        // default: color attribute demo
        const positionAttr =
          pointCloud.points.geometry.getAttribute("position");
        pointCloud.points.geometry.setAttribute("color", positionAttr);

        // // use_color
        // pointCloud.points.material.color = 0xfff000;
        // gui.addColor(pointCloud.points.material, "color");

        // // use_gradient
        // const gradient = {
        //   minColor: 0x00ffff,
        //   maxColor: 0x0000ff,
        // };
        // pointCloud.points.material.gradient = [
        //   [0, gradient.minColor],
        //   [1, gradient.maxColor],
        // ];
        // gui
        //   .addColor(gradient, "minColor")
        //   .name("gradient_1")
        //   .onChange(() => {
        //     pointCloud.points.material.gradient = [
        //       [0, gradient.minColor],
        //       [1, gradient.maxColor],
        //     ];
        //   });
        // gui
        //   .addColor(gradient, "maxColor")
        //   .name("gradient_2")
        //   .onChange(() => {
        //     pointCloud.points.material.gradient = [
        //       [0, gradient.minColor],
        //       [1, gradient.maxColor],
        //     ];
        //   });

        const gradientRange = {
          min: 0,
          max: 1,
        };
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
        gui.onChange(() => {
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
