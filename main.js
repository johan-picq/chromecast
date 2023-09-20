const currentContent = document.querySelector("#content");
const currentContentId = currentContent.getAttribute("src");
const currentContentType = currentContent.getAttribute("type");
const castButton = document.querySelector("#cast_button");
var muted = false;

const initializeCastSession = (context, player, playerController) => {
  console.log("CastContext: CastSession connected");
  var mediaInfo = new chrome.cast.media.MediaInfo(
    currentContentId,
    currentContentType
  );
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.currentTime = currentContent.currentTime;
  const localIsPLaying =
    currentContent.currentTime > 0 &&
    !currentContent.paused &&
    !currentContent.ended;
  if (!localIsPLaying) {
    request.autoplay = false;
  }
  var castSession = context.getCurrentSession();
  castSession.loadMedia(request).then(
    function () {
      console.log("Load succeed");
    },
    function (errorCode) {
      console.log("Error code: " + errorCode);
    }
  );

  currentContent.addEventListener("play", () => {
    playerController.playOrPause();
  });

  currentContent.addEventListener("pause", () => {
    playerController.playOrPause();
  });

  currentContent.addEventListener("seeked", () => {
    player.currentTime = currentContent.currentTime;
    playerController.seek();
  });
  currentContent.addEventListener("volumechange", () => {
    if ((currentContent.muted && !muted) || (!currentContent.muted && muted)) {
      muted = !muted;
      playerController.muteOrUnmute();
    } else {
      player.volumeLevel = currentContent.volume;
      playerController.setVolumeLevel();
    }
  });
};

const initializeCastApi = () => {
  const context = cast.framework.CastContext.getInstance();
  const player = new cast.framework.RemotePlayer();
  const playerController = new cast.framework.RemotePlayerController(player);

  context.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
  });

  context.addEventListener(
    cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
    (event) => {
      switch (event.sessionState) {
        case cast.framework.SessionState.SESSION_STARTED:
          initializeCastSession(context, player, playerController);
          break;
        case cast.framework.SessionState.SESSION_RESUMED:
          console.log("CastContext: CastSession resumed");
          break;
        case cast.framework.SessionState.SESSION_ENDED:
          console.log("CastContext: CastSession disconnected");
          // Update locally as necessary
          break;
      }
    }
  );
};

window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};
