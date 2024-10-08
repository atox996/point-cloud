import classNames from "classnames";
import styles from "./index.module.less";
import { MainViewer, PointCloud, SideViewer } from "@/renderer";

const Home = () => {
  const initialized = useRef(false);

  const mainViewerRef = useRef<HTMLDivElement>(null);
  const overheadViewerRef = useRef<HTMLDivElement>(null);
  const sideViewerRef = useRef<HTMLDivElement>(null);
  const rearViewerRef = useRef<HTMLDivElement>(null);

  const pointCloud = new PointCloud();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const mainViewer = new MainViewer(mainViewerRef.current!, pointCloud);
    const overheadViewer = new SideViewer(
      overheadViewerRef.current!,
      pointCloud,
      { axis: "z" },
    );
    const sideViewer = new SideViewer(sideViewerRef.current!, pointCloud, {
      axis: "y",
    });
    const rearViewer = new SideViewer(rearViewerRef.current!, pointCloud, {
      axis: "x",
    });

    overheadViewer.fitObject(pointCloud.trimBox);
    sideViewer.fitObject(pointCloud.trimBox);
    rearViewer.fitObject(pointCloud.trimBox);

    pointCloud
      .load("http://10.8.33.95:3000/pcd/Staging_6669_72.pcd")
      .then(() => {
        mainViewer.render();
        overheadViewer.render();
        sideViewer.render();
        rearViewer.render();
      });
  }, []);

  return (
    <div className={classNames(styles["page-wrapper"])}>
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
