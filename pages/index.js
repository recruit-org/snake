import dynamic from "next/dynamic";

import Game from "../src/components/Game";

export default dynamic(() => Promise.resolve(Game), {
  ssr: false,
});
