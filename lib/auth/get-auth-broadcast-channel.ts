export function getAuthBroadcastChannel():BroadcastChannel|null {
  let authBroadcastChannel:BroadcastChannel|null = null;

  if (typeof window === "undefined") {
    authBroadcastChannel = null;
  }else{//typeof window
    if(window.BroadcastChannel){
      authBroadcastChannel = new BroadcastChannel(
        "auth-broadcast-channel"
      );
    }else{
      authBroadcastChannel = null;
    }
  }//typeof window
  return authBroadcastChannel;

}