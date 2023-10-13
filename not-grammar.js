module.exports = grammar({
    name: 'a',

    extras: $ => [$.comment,/\s/],

    rules: {
        maidata: $ => repeat($._definition),

        _definition: $ => choice(
            $.title_definition,
            $.artist_definition,
            $.smsg_definition,
            $.des_definition,
            $.first_definition,
            $.lv_definition,
            $.inote_definition,
            $.amsg_first_definition,
            $.amsg_time_definition,
            $.amsg_content_definition
        ),

        title_definition: $ => seq('&title=',$.title),
        title:$=>seq($.title_norm,optional(seq($._title_delimiter,$.title_mini))),
        title_norm:$=>seq(/[^&+%\\┃]*/m,repeat(choice($.escape,/[^&+%\\┃]+/m))),
        _title_delimiter:$=>/┃/,
        title_mini:$=>$._text,

        artist_definition: $ => seq('&artist=',$.artist),
        artist:$=>$._text,

        smsg_definition: $ => seq(
            choice(
                '&smsg=',
                alias('&smsg_1=',$.diff_easy),
                alias('&smsg_2=',$.diff_basic),
                alias('&smsg_3=',$.diff_advanced),
                alias('&smsg_4=',$.diff_expert),
                alias('&smsg_5=',$.diff_master),
                alias('&smsg_6=',$.diff_remaster),
                alias('&smsg_7=',$.diff_original),
            ),
            $.smsg
        ),
        smsg:$=>seq($.smsg_row,repeat(seq($._msg_row_delimiter,$.smsg_row))),
        smsg_row:$=>seq(/[^&+%\\┓]*/m,repeat(choice($.escape,/[^&+%\\┓]+/m))),

        des_definition: $ => seq(
            choice(
                '&des=',
                alias('&des_1=',$.diff_easy),
                alias('&des_2=',$.diff_basic),
                alias('&des_3=',$.diff_advanced),
                alias('&des_4=',$.diff_expert),
                alias('&des_5=',$.diff_master),
                alias('&des_6=',$.diff_remaster),
                alias('&des_7=',$.diff_original),
            ),
            $.des
        ),
        des:$=>$._text,


        lv_definition: $ => seq(
            choice(
                alias('&lv_1=',$.diff_easy),
                alias('&lv_2=',$.diff_basic),
                alias('&lv_3=',$.diff_advanced),
                alias('&lv_4=',$.diff_expert),
                alias('&lv_5=',$.diff_master),
                alias('&lv_6=',$.diff_remaster),
                alias('&lv_7=',$.diff_original),
            ),
            $.lv
        ),
        lv:$=>choice(
            seq($._exponum,optional('+')),
            /※[^&+%\\]/,
            seq(/※/,$.escape),
        ),

        first_definition: $ => seq(
            choice(
                '&first=',
                alias('&first_1=',$.diff_easy),
                alias('&first_2=',$.diff_basic),
                alias('&first_3=',$.diff_advanced),
                alias('&first_4=',$.diff_expert),
                alias('&first_5=',$.diff_master),
                alias('&first_6=',$.diff_remaster),
                alias('&first_7=',$.diff_original),
            ),
            $.first
        ),
        amsg_first_definition: $ => seq('&amsg_first=',$.first),
        first:$=>$._exponum,

        amsg_time_definition: $ => seq('&amsg_time=',$.amsg_time),
        amsg_time: $ => seq($._amsg_divisions,optional($.end)),
        _amsg_divisions: $ => seq(alias($.amsg_division1,$.amsg_division),repeat($.amsg_division)),

        amsg_division1: $ => seq(
            $.bpm_change,
            $.division_change,
            optional(choice($.next_amsg,$._rest))
        ),

        amsg_division: $ => seq(
            ',',
            optional($.bpm_change),
            optional($.division_change),
            optional(choice($.next_amsg,$._rest))
        ),

        amsg_content_definition: $ => seq('&amsg_content=',$.amsg_content),
        amsg_content:$=>repeat1(seq($._amsg_delimiter,$.amsg_msg)),
        amsg_msg:$=>seq($.amsg_row,repeat(seq($._msg_row_delimiter,$.amsg_row))),
        amsg_row:$=>seq(/[^&+%\\┃┓]*/m,repeat(choice($.escape,/[^&+%\\┃┓]+/m))),

        inote_definition: $ => seq(
            choice(
                alias('&inote_1=',$.diff_easy),
                alias('&inote_2=',$.diff_basic),
                alias('&inote_3=',$.diff_advanced),
                alias('&inote_4=',$.diff_expert),
                alias('&inote_5=',$.diff_master),
                alias('&inote_6=',$.diff_remaster),
                alias('&inote_7=',$.diff_original),
            ),
            $.inote
        ),

        inote: $ => seq($._inote_divisions,optional($.end)),

        _inote_divisions: $ => seq(
            alias($.inote_division1,$.inote_division),
            repeat($.inote_division),
        ),

        inote_division1: $ => seq(
            $.bpm_change,
            $.division_change,
            optional(choice($.notes,$._rest))
        ),

        inote_division: $ => seq(
            ',',
            optional($.bpm_change),
            optional($.division_change),
            optional(choice($.notes,$._rest))
        ),

        end: $ => 'E',

        bpm_change: $ => seq( '(',$._number,')' ),

        division_change: $ => seq(
            '{',
            choice(
                $._number,
                seq('#',$._exponum)
            ),
            '}'
        ),

        notes: $ => seq(
            $._note_pseudo,
            repeat(seq('`',$._note_pseudo))
        ),

        _note_pseudo: $ => seq(
            $._note,
            repeat(seq('/',$._note))
        ),

        _note: $ => choice(
            $.tap,
            $.tap_each,
            $.hold,
            $.touch,
            $.touch_hold,
            $.slide
        ),

        slide: $ => seq(
        //    '1-5[4:3]'
            choice(
                seq($._pos,optional(choice($.type_break,$.type_ex)),optional($.shape_ring)),
                seq($._pos,$.shape_ring,optional(choice($.type_break,$.type_ex))),
                seq($._pos,choice('?','!'))
            ),
            $._slide_type,
            $._pos,
            $._slide_duration,
            repeat(seq(
                '*',
                $._slide_type,
                $._pos,
                $._slide_duration,
            ))
        ),

        _slide_type: $ => choice(
            '-', '^', '<', '>', 'v', 'p', 'q', 's', 'z', 'pp', 'qq', seq('V',$._pos), 'w'
        ),

        touch: $ => seq($._sensor,optional($.fireworks)),

        touch_hold: $ => seq(
            choice(
                seq($._sensor,$.shape_hold,optional($.fireworks)),
                seq($._sensor,$.fireworks,$.shape_hold)
            ),
            $._hold_duration
        ),

        hold: $ => seq(
            choice(
                seq($._pos,$.shape_hold,optional($.type_ex)),
                seq($._pos,$.type_ex,$.shape_hold)
            ),
            $._hold_duration
        ),

        tap_each: $ => seq($._pos,repeat1($._pos)),

        tap: $ => choice(
            seq($._pos,optional(choice($.type_break,$.type_ex)),optional(choice($.shape_star,$.shape_star_spin))),
            seq($._pos,choice($.shape_star,$.shape_star_spin),optional(choice($.type_break,$.type_ex)))
        ),

        type_break: $ => 'b',
        type_ex: $ => 'x',

        shape_ring: $ => '@',
        shape_hold: $ => 'h',
        shape_star: $ => '$',
        shape_star_spin: $ => '$$',

        fireworks: $ => 'f',

        _hold_duration: $ => seq(
            '[',
            choice(
                seq(/\d+([eE]\d+)?/,':',/\d+([eE]\d+)?/),
                seq('#',/\+?(\d*\.\d+|\d+\.?)([Ee]\+?\d+)?/)
            ),
            ']'
        ),

        _slide_duration: $ => seq(
            '[',
            choice(
                seq(/\d+([eE]\d+)?/,':',/\d+([eE]\d+)?/),
            ),
            ']'
        ),

        _sensor: $ => /[ABDE][1-8]|C[12]?/,
        _pos: $ => /[1-8]/,
        _rest: $ => '0',
        _diff: $ => /_[1-7]/,
        _text: $ => seq(/[^&+%\\]*/m,repeat(choice($.escape,/[^&+%\\]+/m))),
        _number: $ => /\d*\.\d+|\d+\.?/,
        _natural:$=>/\d+/,
        next_amsg:$=>'1',

        _exponum:$=>/[+-]?(\d*\.\d+|\d+\.?)([Ee][+-]?\d+)?/,
        _msg_row_delimiter: $ => '┓',
        _amsg_delimiter: $ => '┃',
        escape: $ => /\\[＆＋％￥]/,
        comment: $ => /\|\|[^\n]*/
    }
});
