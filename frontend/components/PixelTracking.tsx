// components/PixelTracking.tsx
import { useEffect } from "react";
//  (if (process.env.NODE_ENV === 'production')) // import LosGuardiasTracker from 'losguardias-tracker';
const PixelTracking = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `!async function(){
      if(navigator.webdriver||!(await new Promise(r=>{
        let e=performance.now(),t=1;
        requestAnimationFrame(()=>{(performance.now()-e<2)&&(t=0),r(t)}),
        setTimeout(()=>r(t),5)
      }))) return fetch("https://losguardias.com/rest/detect/f2c4b41b-d8f6-4895-9972-5ecf7060a108.png?js=1").catch(1);
      let n=new Image;
      n.src=\`https://losguardias.com/rest/detect/f2c4b41b-d8f6-4895-9972-5ecf7060a108.png?js=2&fp=\${encodeURIComponent([
        navigator.userAgent,
        navigator.language,
        screen.width+"x"+screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      ].join("|"))}&src=\${encodeURIComponent(location.href)}\`;
      n.style.display="none";
      document.body.appendChild(n);
    }()`;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <a
        href="https://losguardias.com/rest/detect/f2c4b41b-d8f6-4895-9972-5ecf7060a108.png"
        style={{ display: "none" }}
        rel="nofollow"
      >
        @prompt:/?
      </a>
      <img
        src="https://losguardias.com/rest/detect/f2c4b41b-d8f6-4895-9972-5ecf7060a108.png?js=0"
        width={1}
        height={1}
        style={{ display: "none" }}
        alt=""
      />
      <noscript>
        <img
          src="https://losguardias.com/rest/detect/f2c4b41b-d8f6-4895-9972-5ecf7060a108.png?noscript=1"
          style={{ display: "none" }}
          alt=""
        />
      </noscript>
    </>
  );
};

export default PixelTracking;
