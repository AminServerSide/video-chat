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

socket.on("call-made", async (data) => {
    const confirmed = confirm(
        `کاربر   ${data.socket} می خواهد با شما تماس بگیرد . ایا قبول می کنید؟`
    );

    if (!confirmed) {
        socket.emit("reject-call", {
            from: data.socket,
        });

        return;
    }

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    socket.emit("make-answer", {
        answer,
        to: data.socket,
    });
});

socket.on("answer-made", async (data) => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    callUser(data.socket);
});

socket.on("call-rejected", (data) => {
    alert(`کاربر   ${data.socket} تماس شما را قبول نکرد!`);
    //Unselect active user
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
