//field(fieldName, rule)
module.exports = grammar({
    name: 'tree_sitter_simai',

    rules: {
        inote: $ => seq($.setBpm, $.setDenominator, repeat($.division), $.end),
        division: $ => seq(optional($.setBpm), optional($.setDenominator), optional(seq($.pseudo, repeat(seq("`", $.pseudo)))), ","),
        pseudo: $ => seq($._note, repeat(seq("/", $._note))),
        _note: $ => choice($.taps, $.tap, $.hold, $.slides, $.touch, $.touchHold),

        taps: $ => prec(1, repeat1($._button)),
        tap: $ => seq($._button, repeat1($.decorationTap)),
        hold: $ => seq($._button, repeat($.decorationHold), "h", repeat($.decorationHold), optional($.duration)),
        slides: $ => seq($._button, repeat($.decorationStar), $.slide, repeat(seq("*", $.slide))),
        slide:$ => seq(
            choice(
                seq($.shape, $._position, $.durationDelay),
                seq($.shape, $._position, repeat1(seq($.shape, $._position)), $.durationDelay), // why can't i combine these rules??
                seq($.shape, $._position, $.duration, repeat1(seq($.shape, $._position, $.duration)))
            ), 
            optional($.decorationSlide)
        ),
        touch: $ => seq($._sensor, optional($.decorationTouch)), // probably should be repeat()
        touchHold:$ => seq($._sensor, repeat($.decorationTouch), "h", repeat($.decorationTouch), $.duration),

        shape: $ => choice("-", "^", ">", "<", "v", "p", "q", "s", "z", "pp", "qq", seq("V", $._position), "w"),

        decorationTap: $ => choice($.setBreak, $.setEx, $.setFakeStar),
        decorationHold: $ => choice($.setBreak, $.setEx),
        decorationStar: $ => choice($.setBreak, $.setEx, $.setFakeTap, $.setNoStar),
        decorationSlide: $ => choice($.setBreak),
        decorationTouch: $ => choice($.setFirework),

        setBreak: $ => "b",
        setEx: $ => "x",
        setFirework: $ => "f",
        setFakeStar: $ => choice("$$", "$"),
        setFakeTap: $ => "@",
        setNoStar: $ => choice("?", "!"),

        duration: $ => seq(
            "[",
            choice(
                $.measure, 
                seq("#", $.length), 
                seq($.bpm, "#", $.measure)
                ), 
            "]"
        ),

        durationDelay: $ => seq(
            "[", 
            choice(
                $.measure,                                  //delay usual,          duration usual
                seq($.bpm, "#", $.measure),                 //delay usual,          duration in another bpm
                seq($.bpm, "#", $.length),                  //delay in another bpm, duration as length
                seq($.length, "##", $.length),              //delay as length,      duration as length
                seq($.length, "##", $.measure),             //delay as length,      duration usual
                seq($.length, "##", $.bpm, "#", $.measure)  //delay as length,      duration in another bpm
            ), 
            "]"
        ),

        measure: $ => seq($._num, ":", $._num),
        length: $ => $._decimal,
        
        _button: $ => $._position,
        _sensor: $ => choice(seq(choice("A", "B", "D", "E"), $._position), "C", "C1", "C2"),

        _position: $ => token(choice("1", "2", "3", "4", "5", "6", "7", "8")),

        setBpm: $ => seq(
            "(", 
            choice(
                $.bpm,
                seq("#", $.length)
            ), 
            ")"),
        setDenominator: $ => seq("{", $._denominator, "}"),

        bpm: $ => $._decimal,
        _denominator: $ => $._decimal,

        _num: $ => repeat1($._digit),
        _decimal: $ => choice(
            seq(repeat($._digit), ".", repeat1($._digit)),
            seq(repeat1($._digit), optional("."))
        ),

        _digit: $ => choice("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"),

        end: $ => "E",
    },

    conflicts: $ => [
        [$.measure, $._decimal],
        [$.decorationTap, $.decorationHold, $.decorationStar], // "1b...", the stuffs are behind
    ],
});