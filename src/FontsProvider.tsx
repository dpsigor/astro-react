import { createContext, useState, useEffect, ReactNode } from "react";

export const FontsContext = createContext<boolean>(false);

async function loadFonts(rootPath: string) {
  const fonts = [
    {
      fontFamily: "glyphsFont",
      fontStyle: "normal",
      fontWeight: "400",
      src: `${rootPath}/Astrodotbasic-ow3Pd.ttf`,
    },
  ];

  for (let i = 0; i < fonts.length; i++) {
    const fontProps = fonts[i];
    const fontFamily = fontProps.fontFamily;
    const fontWeight = fontProps.fontWeight;
    const fontStyle = fontProps.fontStyle;
    let fontUrl = Array.isArray(fontProps["src"])
      ? fontProps["src"][0][0]
      : fontProps["src"];
    if (fontUrl.indexOf("url(") === -1) {
      fontUrl = "url(" + fontUrl + ")";
    }
    const font = new FontFace(fontFamily, fontUrl);
    font.weight = fontWeight;
    font.style = fontStyle;
    await font.load();
    document.fonts.add(font);
    // apply font styles to body
    const fontDOMEl = document.createElement("div");
    fontDOMEl.textContent = "";
    document.body.appendChild(fontDOMEl);
    fontDOMEl.setAttribute(
      "style",
      `position:fixed; height:0; width:0; overflow:hidden; font-family:${fontFamily}; font-weight:${fontWeight}; font-style:${fontStyle}`
    );
  }
}

export const FontsProvider = ({
  children,
  rootPath,
}: {
  children: ReactNode;
  rootPath: string;
}) => {
  const [ok, setOK] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      await loadFonts(rootPath);
      setOK(true);
    };

    load();
  }, []);

  return <FontsContext.Provider value={ok}>{children}</FontsContext.Provider>;
};
