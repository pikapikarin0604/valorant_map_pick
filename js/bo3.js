let team_dict = {
    "今回本気だから。": ["Dora", "むらけん", "けぷ太郎", "はみえる", "ちょす"],
    "株式会社ありすみるく": ["さくや", "いおりん", "はやゆう", "ましろ", "らる"],
    "Sylvanian Families": ["ずにき", "しゃお", "Nagia", "ぴらふ", "しるばー"],
    "MYSTUG": ["Yoru", "taxi", "せいと", "ゆぐ", "むにぽむ"],
    "他責連合": ["kimu", "しのちゃ", "ねるあ", "wing", "ごり"],
    "10 years later...": ["okaka", "yuki", "aqua", "めんぼ", "そっぴ"],
};

let team_side_dict = {};

let pattern_a = ["team_a", "team_b","team_a", "team_b","team_a", "team_b","team_a"];
let pattern_b = ["team_b", "team_a","team_b", "team_a","team_b", "team_a","team_b"];

let pattern_list = [pattern_a, pattern_b];

let pattern_result = [];

let team_a_name = "";
let team_b_name = "";

let select_start_side_team = "";
let not_select_start_side_team = "";

let pick_index = 0;

const lastProcess = () => {
    $(".select_map").fadeOut(function(){
        $(".map_pick_wrapper").fadeOut(function(){
            $(this).css({
                "height": "60vh"
            });

            $(`#team_a`).prependTo(".map_pick_wrapper").css({
                'margin-right':"40px",
                'margin-top':"322px"
            }).find("th").text(team_side_dict["team_a"]);
    
            $(`#team_b`).appendTo(".map_pick_wrapper").css({
                'margin-left':"40px",
                'margin-top':"322px"
            }).find("th").text(team_side_dict["team_b"]);
            
            $(`#team_a`).find("select").hide();
            $(`#team_b`).find("select").hide();
            $(".map_pick_wrapper").fadeIn();
            $(".select_map.pick").fadeIn();
            $(".champions_icon").fadeIn();
        });
    });
};

const selectStartSide = (insert_index) => {
    $(".start_side_img").click(function(){
        let start_side = $(this).attr("side");
        $(`.start_side_decision_button[side='${start_side}']`).fadeIn();
    });

    $(".start_side_decision_button:not(.cancel)").click(function(){
        let start_side = $(this).attr("side");
        let insert_side = "";

        if(start_side == "defender"){
            insert_side = "Defender";
        }
        else if(start_side == "attacker"){
            insert_side = "Attacker";
        };

        $(`.map_img_table`).eq(pick_index-1).find(".select_start_side").html(
            `<p class='${pattern_result[insert_index]}_color select_stide_team_name'>${team_side_dict[pattern_result[insert_index]]}</p><br>${insert_side}`
        ).fadeIn();

        $(`.start_side_decision_button[side='${start_side}']`).fadeOut();

        $(`#start_side`).fadeOut(function(){
            $("#map_list").fadeIn();
        });

        if(pick_index == 7){
            lastProcess();
        };
    });
    $(".start_side_decision_button.cancel").click(function(){
        let start_side = $(this).attr("side");
        $(`.start_side_decision_button[side='${start_side}']`).fadeOut();
    });
};

const mapPick = () => {
    $(".map_list_img").click(function(){
        let map_name = $(this).attr("map_name");
        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeIn();
    });

    $(".map_ban_decision_button:not(.cancel)").click(function(){
        pick_index += 1;

        let map_name = $(this).attr("map_name");
        let img_url = $(this).prev().attr("src");
        let remove_target = $(this).parent().parent();
        let insert_index = pick_index - 2;
        if(pick_index == 7){
            insert_index = pick_index - 1;
        };

        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeOut();
        $(".not_done_pick .map_img").first().fadeOut(function(){
            remove_target.fadeOut();
            $(".not_done_pick .map_img.picked").first().attr("src", img_url).fadeIn(function(){
                if(pick_index == 3 || pick_index == 4 || pick_index == 7){
                    $("#map_list").fadeOut(function(){
                        const attacker_random_index = 1 + Math.floor(Math.random() * 6);
                        const defender_random_index = 1 + Math.floor(Math.random() * 6);
                        $(".start_side_img[side='attacker']").attr("src", `../img/attacker_${attacker_random_index}.jpg`);
                        $(".start_side_img[side='defender']").attr("src", `../img/defender_${defender_random_index}.jpg`);
    
                        $("#select_start_side_team_name").text(team_side_dict[pattern_result[insert_index]]).attr("class", `${pattern_result[insert_index]}_color`);
                        $("#start_side").fadeIn(function(){
                            selectStartSide(insert_index);
                        });
                    });
                }
                else{
                    $(".not_done_pick .map_img").first().css({
                        "position": 'absolute',
                        'opacity': '0.7'
                    });
                    $(".not_done_pick .map_img").first().fadeIn(function(){
                        $(this).prev().fadeIn();
                        if(pick_index == 6){
                            $(".select_map_list td:not([style='display: none;']) .map_ban_decision_button").click();
                        };
                    });
                };
                $(".not_done_pick").first().removeClass("not_done_pick");
            });
        });
    });

    $(".map_ban_decision_button.cancel").click(function(){
        let map_name = $(this).attr("map_name");
        $(`.map_ban_decision_button[map_name='${map_name}']`).fadeOut();
    });
};


const createTeamBanner = (team_member_list, team_side) => {
    let team_member = team_member_list.shift();

    if(team_member != undefined){
        let tr = $(`.team_banner.team_member_${team_side}[style='display: none;']`).first();
            tr.find("p").text(team_member);
            tr.fadeIn('slow');

        setTimeout(() => {
            createTeamBanner(team_member_list, team_side);
        }, "200");
    }
    else{
        let next_flg = true;

        $("select").each(function(){
            if($(this).val() == ""){
                next_flg = false;
            };
        });

        if(next_flg){
            $("#team_form_complete").fadeIn('slow');
            $("#team_form_complete_button").click(function() {
                $("#team_name_input").fadeOut();
                setTimeout(() => {
                    $("#map_pick").fadeIn(function(){
                        team_side_dict = {"team_a":team_a_name, "team_b":team_b_name};
                        const random_index = Math.floor(Math.random() * 2);
                        pattern_result = pattern_list[random_index];
                        $(".team_name").each(function(index){
                            if(index != 6){
                                $(this).text(team_side_dict[pattern_result[index]]);
                                $(this).addClass(`${pattern_result[index]}_color`);
                            };
                        });
                        select_start_side_team = pattern_result.slice(-1)[0];
                        not_select_start_side_team = pattern_result.slice(-2)[0];
                    });
                    $("#map_list").fadeIn(function(){
                        mapPick();
                    });
                }, "600");
            });

        };
    };
};

$(window).on('load', function () {
    $('[name="team"]').change(function() {

        let team_side = $(this).attr("team");
        let team_name = $(this).val();

        if(team_side == "a"){
            team_a_name = team_name;
        }
        else{
            team_b_name = team_name;
        };

        let team_list = [...team_dict[team_name]];

        createTeamBanner(team_list, team_side);
    });
});