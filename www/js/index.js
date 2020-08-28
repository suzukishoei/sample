// アクセストークンを保存する
var accessToken;

/**
 * ページの初期設定
 */
document.addEventListener('init', function (event) {
  // 表示対象のページを取得
  var page = event.target;

  // リストページの時、タスクを取得する
  if (page.matches('#list')) {
    // タスクを取得
    getTasks();
  }
});

/**
 * リストを表示する
 */
var dispList = function (data) {
  // list.htmlの<ons-list id="listView">を取得
  var elem_list = document.getElementById('listView');
  // 子要素を全て削除
  elem_list.textContent = null;

  // データ数に応じて一覧を作成
  for (var i = 0; i < data.items.length; i++) {
    // アイテムを取得
    var item = data.items[i].title;

    // 空の<ons-list-item>を作成
    var elem_list_item = document.createElement('ons-list-item');
    // <ons-list-item>のHTMLにアイテム名を追加
    elem_list_item.innerHTML = item;
    // <ons-list-item>要素をリストに追加
    elem_list.appendChild(elem_list_item);
  }
}

/**
 * Google Tasksからタスクを取得する
 */
var getTasks = function () {

  $.post('https://www.googleapis.com/oauth2/v4/token', {
    'refresh_token': [refresh_token], // 変更する
    'client_id': [client_id],         // 変更する
    'client_secret': [client_secret], // 変更する
    'redirect_uri': 'http://localhost:8000/',
    'grant_type': 'refresh_token',
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .done(function (data, status) {    // トークンの取得に成功
      accessToken = data.access_token;
      console.log(accessToken);

      // タスクを取得(デフォルトのリストを指定)
      $.get('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        'access_token': accessToken,
      })
        .done(function (data, status) {
          console.log(status, data);
          // 取得したタスクでリストを表示
          dispList(data);
        })
        .fail(function (data, status) {
          console.log(status, data);
        });

    })
    .fail(function (data, status) {    // トークンの取得に失敗
      console.log(status, data);
    });
}


/**
 * Google Tasksにタスクを追加する
 */
var insertTask = function () {
  // 入力値の取得
  item = document.getElementById('input_task_title').value;

  if (!accessToken) {
    return;
  }

  var inputTask = {
    'title': item
  }

  $.ajax({
    type: 'post',
    url: 'https://www.googleapis.com/tasks/v1/lists/@default/tasks?access_token=' + accessToken,
    data: JSON.stringify(inputTask), // 追加するタスク情報
    contentType: 'application/JSON',
    dataType: 'JSON',
    scriptCharset: 'utf-8',

    success: function (data, status) {
      console.log(status, data);
      hideInsertDialog();
      getTasks(); // リストを更新
    },

    error: function (data, status) {
      // Error
      console.log(status, data);
    }
  });
};

/**
 * タスク追加ダイアログを表示
 */
var createInsertDialog = function () {

  var dialog = document.getElementById('insert-task');

  if (dialog) {
    dialog.show();
  } else {
    ons.createElement('insert_task_dialog.html', { append: true })
      .then(function (dialog) {
        dialog.show();
      });
  }
};

/** 
 * タスク追加ダイアログを非表示
 */
var hideInsertDialog = function () {
  document.getElementById('insert-task').hide();
};
