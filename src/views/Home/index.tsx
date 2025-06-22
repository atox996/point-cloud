import classNames from "classnames";

import rawData from "@/../public/camera.json";
import BoxSvg from "@/assets/box.svg?react";
import { OrthographicViewer, PerspectiveViewer } from "@/renderer";
import { normalizeCameraParameters } from "@/renderer/utils";
import { useShareContext } from "@/stores/ShareContext";

import ImageViewer from "./components/ImageViewer";
import styles from "./index.module.less";

const { intrinsics, extrinsics } = normalizeCameraParameters(rawData);

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

  const [cameras] = useState([
    {
      img: "/center_camera_fov120.jpg",
      extrinsics,
      intrinsics,
    },
  ]);

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
      <div className={classNames(styles["main-viewer"])} ref={mainViewerRef}>
        <div className={classNames(styles["images-viewer"])}>
          {cameras.map((camera) => (
            <ImageViewer {...camera} key={camera.img} />
          ))}
        </div>
      </div>
      <div className={classNames(styles["side-viewer"])}>
        <div ref={overheadViewerRef}></div>
        <div ref={sideViewerRef}></div>
        <div ref={rearViewerRef}></div>
      </div>
    </div>
  );
};

export default Home;
