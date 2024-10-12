const socket = io("localhost:3000");

const { RTCPeerConnection, RTCSessionDescription } = window;

const peerConnection = new RTCPeerConnection();

async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId,
    });
}

socket.on("update-user-list", ({ users }) => {
    const activeUserContainer = document.getElementById(
        "active-user-container"
    );

    users.forEach((socketId) => {
        const userExist = document.getElementById(socketId);

        if (!userExist) {
            const userContainer = document.createElement("div");

            const username = document.createElement("p");

            userContainer.setAttribute("class", "active-user");
            userContainer.setAttribute("id", socketId);
            username.setAttribute("class", "username");
            username.innerHTML = `کاربر : ${socketId}`;

            userContainer.appendChild(username);

            userContainer.addEventListener("click", () => {
                userContainer.setAttribute(
                    "class",
                    "active-user active-user--selected"
                );
                const talkingWithInfo =
                    document.getElementById("talking-with-info");
                talkingWithInfo.innerHTML = `صحبت با :  ${socketId}`;
                callUser(socketId);
            });

            activeUserContainer.appendChild(userContainer);
        }
    });
});

socket.on("remove-user", ({ socketId }) => {
    const user = document.getElementById(socketId);

    if (user) {
        user.remove();
    }
});

navigator.getUserMedia(
    { video: true, audio: true },
    (stream) => {
        const localVideo = document.getElementById("local-video");

        if (localVideo) {
            localVideo.srcObject = stream;
        }
    },
    (error) => {
        console.log(error.message);
    }
);
