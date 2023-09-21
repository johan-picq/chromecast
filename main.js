const currentContent = document.querySelector("#content");
const currentContentId = currentContent.getAttribute("src");
const currentContentType = currentContent.getAttribute("type");

var muted = currentContent.muted;

const listenLocalPlayerPlayerEvent = (remotePlayer, remotePlayerController) => {
  currentContent.addEventListener("play", () => {
    remotePlayerController.playOrPause();
  });

  currentContent.addEventListener("pause", () => {
    remotePlayerController.playOrPause();
  });

  currentContent.addEventListener("seeked", () => {
    remotePlayer.currentTime = currentContent.currentTime;
    remotePlayerController.seek();
  });

  currentContent.addEventListener("volumechange", () => {
    if ((currentContent.muted && !muted) || (!currentContent.muted && muted)) {
      muted = !muted;
      remotePlayerController.muteOrUnmute();
    } else {
      remotePlayer.volumeLevel = currentContent.volume;
      remotePlayerController.setVolumeLevel();
    }
  });
};

const initializeCastSession = (
  context,
  remotePlayer,
  remotePlayerController
) => {
  console.log("CastContext: CastSession connected");
  const localIsPLaying =
    currentContent.currentTime > 0 &&
    !currentContent.paused &&
    !currentContent.ended;
  var mediaInfo = new chrome.cast.media.MediaInfo(
    currentContentId,
    currentContentType
  );
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  var castSession = context.getCurrentSession();

  request.currentTime = currentContent.currentTime;
  if (!localIsPLaying) {
    request.autoplay = false;
  }

  castSession.loadMedia(request).then(
    function () {
      console.log("Load succeed");
      listenLocalPlayerPlayerEvent(remotePlayer, remotePlayerController);
    },
    function (errorCode) {
      console.log("Error code: " + errorCode);
    }
  );
};

const initializeCastApi = () => {
  const context = cast.framework.CastContext.getInstance();
  const remotePlayer = new cast.framework.RemotePlayer();
  const remotePlayerController = new cast.framework.RemotePlayerController(
    remotePlayer
  );

  context.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
  });

  context.addEventListener(
    cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
    (event) => {
      if (event.sessionState === cast.framework.SessionState.SESSION_STARTED) {
        initializeCastSession(context, remotePlayer, remotePlayerController);
      }
    }
  );
};

window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};
