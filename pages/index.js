import dynamic from "next/dynamic";
// import { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useMemo } from "react/cjs/react.production.min";
// import { useCallback } from "react/cjs/react.production.min";
// import styles from "../styles/Snake.module.css";
import Game from "../src/components/Game";

export default dynamic(() => Promise.resolve(Game), {
  ssr: false,
});
