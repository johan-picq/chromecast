const currentContent = document.querySelector("#content");
const currentContentId = currentContent.getAttribute("src");
const currentContentType = currentContent.getAttribute("type");
const castButton = document.querySelector("#cast_button");

const initializeCastApi = () => {
  console.log("initied");
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: "B88B034A",
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });
};

const initializeCastSession = () => {
  var castSession =
    cast.framework.CastContext.getInstance().getCurrentSession();
  var mediaInfo = new chrome.cast.media.MediaInfo(
    currentContentId,
    currentContentType
  );
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  castSession.loadMedia(request).then(
    () => {
      console.log("Load succeed");
    },
    (errorCode) => {
      console.log("Error code: " + errorCode);
    }
  );
};

window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};

castButton.addEventListener("click", initializeCastSession);
