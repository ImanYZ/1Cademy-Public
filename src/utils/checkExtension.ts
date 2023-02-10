export const checkExtension = (extensionId: string, callback: any) => {
  let isChromium = window.chrome;
  let winNav = window.navigator;
  let vendorName = winNav.vendor;
  let isOpera = winNav.userAgent.indexOf("opr") > -1;
  let isIEedge = winNav.userAgent.indexOf("Edg") > -1;
  let isIOSChrome = winNav.userAgent.match("CriOS");
  let chrom = false;
  if (isIOSChrome) {
    chrom = true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    chrom = true;
  } else {
    chrom = false;
  }
  let img;
  img = new (Image as any)({});

  img.src = "chrome-extension://" + extensionId + "/images/icon-8x.png";

  if (!img.src) return;
  if (!chrom) {
    return callback(true);
  }
  img.onload = function () {
    callback(true);
  };
  img.onerror = function () {
    callback(false);
  };
};
