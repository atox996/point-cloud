import classNames from "classnames";
import styles from "./index.module.less";
import { MainViewer, PointCloud, SideViewer } from "@/renderer";
import BoxSvg from "@/assets/box.svg?react";
import { ActionName } from "@/renderer/actions";

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
      .load("http://10.8.33.95:3000/pcd/Staging_6669_72.pcd")
      .finally(() => {
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
