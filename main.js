const currentContent = document.querySelector("#content");
const currentContentId = currentContent.getAttribute("src");
const currentContentType = currentContent.getAttribute("type");
const castButton = document.querySelector("#cast_button");

const initializeCastSession = (context, playerController) => {
  console.log("CastContext: CastSession connected");
  var mediaInfo = new chrome.cast.media.MediaInfo(
    currentContentId,
    currentContentType
  );
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
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
  currentContent.addEventListener("seek", () => {
    playerController.seek();
  });
  currentContent.addEventListener("volumechange", () => {
    console.log("volume change");
    if (currentContent.muted) {
      console.log("mute");
      castSession.setMute(true);
    } else {
      console.log("unmute");
      castSession.setMute(false);
    }
    // castSession.setVolume(currentContent.volume);
    playerController.setVolumeLevel();
  });
  currentContent.addEventListener("ended", () => {
    playerController.stop();
  });
};

const initializeCastApi = () => {
  const context = cast.framework.CastContext.getInstance();
  const player = new cast.framework.RemotePlayer();
  const playerController = new cast.framework.RemotePlayerController(player);

  context.setOptions({
    receiverApplicationId: "B88B034A",
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });

  context.addEventListener(
    cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
    (event) => {
      switch (event.sessionState) {
        case cast.framework.SessionState.SESSION_STARTED:
          initializeCastSession(context, playerController);
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

  // playerController.addEventListener(
  //   cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
  //   () => {
  //     const session = context.getCurrentSession();
  //     if (!session) {
  //       return;
  //     }
  //     const mediaStatus = session.getMediaSession();
  //     if (!mediaStatus) {
  //       return;
  //     }
  //     let mediaInfo = mediaStatus.media;
  //     console.log("playerController have been change : ", mediaInfo);
  //   }
  // );
};

window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};
