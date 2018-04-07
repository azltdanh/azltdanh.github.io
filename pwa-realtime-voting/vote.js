var ably = new Ably.Realtime('FhDa8w.9zcXgA:hzaRB6s_CWizWGue');
var channel = ably.channels.get('vote-channel');

$('.topic-rating').on('click', '.btn-rating', function (e) {
    var $el = $(e.target);
    $el.fadeOut(200, function () {
        var key = $el.data('key');
        console.log('click', key);
        var data = {};
        data[key] = 1;
        channel.publish("update", data, errCallback);
        $el.fadeIn(100);
    });

});

function errCallback(err) {
    if (err) {
        console.error(err.message);
    }
}
