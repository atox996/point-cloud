import classNames from "classnames";

import BoxSvg from "@/assets/box.svg?react";
import { PerspectiveViewer, ShareScene } from "@/renderer";

import styles from "./index.module.less";

const Home = () => {
  const mainViewerRef = useRef<HTMLDivElement>(null);
  const overheadViewerRef = useRef<HTMLDivElement>(null);
  const sideViewerRef = useRef<HTMLDivElement>(null);
  const rearViewerRef = useRef<HTMLDivElement>(null);

  const shareScene = useMemo(() => new ShareScene(), []);

  const mainViewer = useRef<PerspectiveViewer>(null);

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
    return () => {
      mainViewer.current?.dispose();
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
