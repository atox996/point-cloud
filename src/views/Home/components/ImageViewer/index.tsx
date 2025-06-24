import classNames from "classnames";

import { ImageViewer } from "@/renderer";
import { useShareContext } from "@/stores/ShareContext";

import styles from "./index.module.less";

interface IProps {
  img: string;
}

export default (props: IProps) => {
  const { shareScene } = useShareContext();

  const ref = useRef<HTMLDivElement>(null);
  const imageViewer = useRef<ImageViewer>(null);
  useEffect(() => {
    imageViewer.current = new ImageViewer(ref.current!, shareScene, {
      name: "image-viewer",
      ...props,
    });
    return () => {
      imageViewer.current?.dispose();
    };
  }, []);
  return (
    <div className={classNames(styles["image-viewer"])}>
      <div ref={ref} className={classNames(styles["image-container"])}></div>
    </div>
  );
};
