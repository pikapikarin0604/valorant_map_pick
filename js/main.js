let team_dict = {
    "今回本気だから。": ["Dora", "むらけん", "けぷ太郎", "はみえる", "ちょす"],
    "株式会社ありすみるく": ["さくや", "いおりん", "はやゆう", "ましろ", "らる"],
    "Sylvanian Families": ["ずにき", "しゃお", "Nagia", "ぴらふ", "しるばー"],
    "MYSTUG": ["Yoru", "taxi", "せいと", "ゆぐ", "むにぽむ"],
    "他責連合": ["kimu", "しのちゃ", "ねるあ", "wing", "ごり"],
    "10 years later...": ["okaka", "yuki", "aqua", "めんぼ", "そっぴ"],
};

let team_side_dict = {};

let pattern_a = ["team_a", "team_b", "team_a", "team_b", "team_a", "team_b", "team_a"];
let pattern_b = ["team_b", "team_a", "team_b", "team_a", "team_b", "team_a", "team_b"];

let pattern_list = [pattern_a, pattern_b];

let team_a_name = "";
let team_b_name = "";

let select_start_side_team = "";
let not_select_start_side_team = "";

let pick_index = 0;

const selectStartSide = () => {
    $(".start_side_img").click(function () {
        let start_side = $(this).attr("side");
        $(`.start_side_decision_button[side='${start_side}']`).fadeIn();
    });

    $(".start_side_decision_button:not(.cancel)").click(function () {
        let start_side = $(this).attr("side");
        $(`.${start_side}`).text(team_side_dict[select_start_side_team]).addClass(`${select_start_side_team}_color`);
        $(`.start_side_decision_button[side='${start_side}']`).fadeOut();
        $(".select_map:not(.pick)").fadeOut(function () {
            $(".select_map.pick").css({
                'margin': '0px 200px'
            });

            if (start_side == "defender") {
                $(".attacker").text(team_side_dict[not_select_start_side_team]).addClass(`${not_select_start_side_team}_color`);
                $(`#${not_select_start_side_team}`).appendTo(".map_pick_wrapper").css({
                    "height": '90vh',
                    'margin-top': '500px',
                    'margin-right': "0px"
                }).find("th").text(team_side_dict[not_select_start_side_team]);

                $(`#${select_start_side_team}`).prependTo(".map_pick_wrapper").css({
                    "height": '90vh',
                    'margin-top': '500px',
                    'margin-right': "0px"
                }).find("th").text(team_side_dict[select_start_side_team]);
            }
            else {
                $(".defender").text(team_side_dict[not_select_start_side_team]).addClass(`${not_select_start_side_team}_color`);
                $(`#${select_start_side_team}`).appendTo(".map_pick_wrapper").css({
                    "height": '90vh',
                    'margin-top': '500px',
                    'margin-right': "0px"
                }).find("th").text(team_side_dict[select_start_side_team]);
                $(`#${not_select_start_side_team}`).prependTo(".map_pick_wrapper").css({
                    "height": '90vh',
                    'margin-top': '500px',
                    'margin-right': "0px"
                }).find("th").text(team_side_dict[not_select_start_side_team]);
            };
            $(`#${not_select_start_side_team}`).find("select").hide();
            $(`#${select_start_side_team}`).find("select").hide();
            $(`.start_side_top`).first().hide();
        });
    });
    $(".start_side_decision_button.cancel").click(function () {
        let start_side = $(this).attr("side");
        $(`.start_side_decision_button[side='${start_side}']`).fadeOut();
    });
};

const mapPick = () => {
    const attacker_random_index = 1 + Math.floor(Math.random() * 3);
    const defender_random_index = 1 + Math.floor(Math.random() * 3);
    $(".start_side_img[side='attacker']").attr("src", `../img/attacker_${attacker_random_index}.jpg`);
    $(".start_side_img[side='defender']").attr("src", `../img/defender_${defender_random_index}.jpg`);

    $(".map_list_img").click(function () {
        let map_name = $(this).attr("map_name");
        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeIn();
    });

    $(".map_ban_decision_button:not(.cancel)").click(function () {
        pick_index += 1;

        let map_name = $(this).attr("map_name");
        let img_url = $(this).prev().attr("src");
        let remove_target = $(this).parent().parent();

        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeOut();
        $(".not_done_pick .map_img").first().fadeOut(function () {
            remove_target.fadeOut();
            $(".not_done_pick .map_img.picked").first().attr("src", img_url).fadeIn(function () {
                if (pick_index == 6) {
                    $(this).addClass("pick_map");
                    $("#map_list").fadeOut(function () {
                        $("#map_list .map_img_table td:not([style='display: none;'])").fadeOut(function () {
                            $("#start_side").fadeIn(function () {
                                $("#select_start_side_team_name").text(team_side_dict[select_start_side_team]).addClass(`${select_start_side_team}_color`);
                                selectStartSide();
                            });
                        });
                    });
                }
                else {
                    $(".not_done_pick .map_img").first().css({
                        "position": 'absolute',
                        'opacity': '0.7'
                    });
                    $(".not_done_pick .map_img").first().fadeIn(function () {
                        $(this).prev().fadeIn();
                    });
                };
                $(".not_done_pick").first().removeClass("not_done_pick");
            });
        });
    });

    $(".map_ban_decision_button.cancel").click(function () {
        let map_name = $(this).attr("map_name");
        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeOut();
    });
};


const createTeamBanner = (team_member_list, team_side) => {
    let team_member = team_member_list.shift();

    if (team_member != undefined) {
        let tr = $(`.team_banner.team_member_${team_side}[style='display: none;']`).first();
        tr.find("p").text(team_member);
        tr.fadeIn('slow');

        setTimeout(() => {
            createTeamBanner(team_member_list, team_side);
        }, "200");
    }
    else {
        let next_flg = true;

        $("select").each(function () {
            if ($(this).val() == "") {
                next_flg = false;
            };
        });

        if (next_flg) {
            $("#team_form_complete").fadeIn('slow');
            $("#team_form_complete_button").click(function () {
                $("#team_name_input").fadeOut();
                setTimeout(() => {
                    $("#map_pick").fadeIn(function () {
                        team_side_dict = { "team_a": team_a_name, "team_b": team_b_name };
                        const random_index = Math.floor(Math.random() * 2);
                        const pattern_result = pattern_list[random_index];
                        $(".team_name").each(function (index) {
                            $(this).text(team_side_dict[pattern_result[index]]);
                            $(this).addClass(`${pattern_result[index]}_color`);
                        });
                        select_start_side_team = pattern_result.slice(-1)[0];
                        not_select_start_side_team = pattern_result.slice(-2)[0];
                    });
                    $("#map_list").fadeIn(function () {
                        mapPick();
                    });
                }, "600");
            });

        };
    };
};

$(window).on('load', function () {
    $('[name="team"]').change(function () {

        let team_side = $(this).attr("team");
        let team_name = $(this).val();

        if (team_side == "a") {
            team_a_name = team_name;
        }
        else {
            team_b_name = team_name;
        };

        let team_list = [...team_dict[team_name]];

        createTeamBanner(team_list, team_side);
    });
});