import dynamic from "next/dynamic";
import Snake from "../src/components/snake";

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
