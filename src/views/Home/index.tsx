import classNames from "classnames";

import BoxSvg from "@/assets/box.svg?react";
import { OrthographicViewer, PerspectiveViewer, ShareScene } from "@/renderer";

import styles from "./index.module.less";

const Home = () => {
  const mainViewerRef = useRef<HTMLDivElement>(null);
  const overheadViewerRef = useRef<HTMLDivElement>(null);
  const sideViewerRef = useRef<HTMLDivElement>(null);
  const rearViewerRef = useRef<HTMLDivElement>(null);

  const shareScene = useMemo(() => new ShareScene(), []);

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
    shareScene.loadPointCloud("/test.pcd");
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
    shareScene.addEventListener("pointsChange", () => {
      shareScene.views.forEach((view) => {
        view.focus(shareScene.pointsGroup);
      });
    });
    console.log(shareScene);

    return () => {
      mainViewer.current?.dispose();
      overhead.current?.dispose();
      side.current?.dispose();
      rear.current?.dispose();
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
