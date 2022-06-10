import dynamic from "next/dynamic";
import Snake from "../src/components/Snake";

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
