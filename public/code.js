$(function () {
    var socket = io();
    var myName = null;

    // 登入事件
    $('#join-btn').on("click", function () {
        myName = ($('#new-username').val()).trim();
        if (myName) {
            // 發送事件
            socket.emit('login', { username: myName })
        } else {
            $('#login-fail').show();
            $('#login-fail').html('Please enter a name.');
        }
    });
    $('input#new-username').on("keydown", function (evt) {
        if (evt.key === 'Enter') {
            myName = ($('#new-username').val()).trim();
            if (myName) {
                // 發送事件
                socket.emit('login', { username: myName })
            } else {
                $('#login-fail').show();
                $('#login-fail').html('Please enter a name.');
            }
        }
    });
    /*登入成功*/
    socket.on('loginSuccess', function (data) {
        if (data.username === myName) {
            checkIn(data)
        } else {
            $('#login-fail').show();
            $('#login-fail').html('Wrong username. Please try again!');
        }
    })

    /*登入失敗*/
    socket.on('loginFail', function () {
        $('#login-fail').show();
        $('#login-fail').html('Duplicate name already exists.');
    })

    // 公告使用者進入聊天室
    socket.on('add', function (data) {
        var html = `<div id="update" class="divider d-flex align-items-center mb-4">
                        <p class="text-center mx-3 mb-0" style="color: #a2aab7;">
                        ${data.username} joined the conversation
                        </p>
                    </div>`
        $('#message').append(html);
        $('#online-users').html(`${data.userCount}`); // 更新聊天室人數
    })

    /*隱藏登入頁，顯示聊天頁*/
    function checkIn(data) {
        $("#message").empty(); // 清空聊天紀錄
        $('#join-page').hide('slow');
        $('#chat-page').show('slow');
    }

    $('#leave-btn').on("click", function () {
        let leave = confirm('Are you sure you want to leave?')
        if (leave) {
            /*觸發 logout 事件*/
            socket.emit('logout', { username: myName });
        }
    });

    //離開成功
    socket.on('leaveSuccess', function () {
        checkOut()
    })

    function checkOut() {
        $('#login-fail').hide();
        $('#login-fail').empty();
        $("#join-page").show('slow');
        $("#chat-page").hide("slow");
    }

    //公告使用者離開聊天室
    socket.on('leave', function (data) {
        if (data.username != null) {
            let html = `<div id="update" class="divider d-flex align-items-center mb-4">
                            <p class="text-center mx-3 mb-0" style="color: #a2aab7;">
                            ${data.username} left the conversation
                            </p>
                        </div>`
            $('#message').append(html);
            $('#online-users').html(`${data.userCount}`);
        }
    })

    // 按下發送訊息按鈕(Send)
    $('#send-btn').on("click", function () {
        sendMessage()
    });

    // 按下發送訊息鍵(Enter)
    $('input#send-content').on("keydown", function (evt) {
        if (evt.key === 'Enter') {
            sendMessage()
        }
    });

    function sendMessage() {
        let txt = $('#send-content').val();

        if (txt.length == 0) {
            return;
        }
        /*觸發 sendMessage 事件*/
        socket.emit('sendMessage', { username: myName, message: txt });
        $('#send-content').val('');
        // 發送新訊息後頁面自動下滑到底部
        $("#message").stop().animate({ scrollTop: $("#message")[0].scrollHeight }, 1000);
    }
    /*監聽 receiveMessage事件*/
    socket.on('receiveMessage', function (data) {
        showMessage(data)
    })

    /*顯示訊息*/
    function showMessage(data) {
        var html;
        if (data.username === myName) {

            if ($("#message>div").last().attr("id") == "my-msg") {
                html = `<p id="msg-content" class="small p-2 me-3 mb-1 text-white rounded-3 bg-warning">
                        ${data.message}
                        </p>`
                $("#message>div").last().children().append(html);
            }
            else {
                html = `<div id="my-msg" class="d-flex flex-row justify-content-end mb-4 pt-1">
                    <div>
                        <p id="name" class="small mb-1">YOU</p>
                        <p id="msg-content" class="small p-2 me-3 mb-1 text-white rounded-3 bg-warning">
                        ${data.message}
                        </p>
                    </div>
                </div>`
                $('#message').append(html);
            }
        } else {
            if ($("#message>div").last().attr("id") == "other-msg") {
                html = `<p id="msg-content" class="small p-2 ms-3 mb-1 rounded-3"
                            style="background-color: #f5f6f7;">${data.message}</p>`
                $("#message>div").last().children().append(html);
            }
            else {
                html = `<div id="other-msg" class="d-flex flex-row justify-content-start">
                    <div>
                        <p id="name" class="small mb-1">${data.username}</p>
                        <p id="msg-content" class="small p-2 ms-3 mb-1 rounded-3"
                            style="background-color: #f5f6f7;">${data.message}</p>
                    </div>
                </div>`
                $('#message').append(html);
            }
        }

    }
})