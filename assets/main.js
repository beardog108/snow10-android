/*
 Copyright (c) 2017 Kevin Froman MIT (expat) license
*/
var clipboard = new Clipboard('.btn');

var zero = '​';
var one = '‍';

var z_zero = '​';
var z_one = '‍';

var w_zero = ' ';
var w_one = '\t';


function showError(msg){
$.bootstrapGrowl(msg, {type: 'danger'})
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

clipboard.on('success', function(e) {
	$('#copyFeedback').css('display', 'inherit');
	$('#copyFeedback').css('color', 'green');
	$('#copyFeedback').html('Copied!');
    e.clearSelection();
});

clipboard.on('error', function(e) {
	$('#copyFeedback').css('display', 'inherit');
	$('#copyFeedback').css('color', 'red');
	$('#copyFeedback').html('Your browser doesn\'t seem to support automatic copying. Get a better one.');
    e.clearSelection();
});

if ($('#useEncrypt').is(':checked') == false)
{
	$('#encryptArea').css('display', 'none');
}

$('#modalClose').click(function(){
	$('#copyFeedback').css('display', 'none');
});


$("#output").on("click", function () {
   $(this).select();
});

$('#useZeroWidthCharacters').click(function(){

	if (zero == w_zero)
	{
		zero = z_zero;
		one = z_one;
	}
	else
	{
        zero = w_zero;
        one = z_one;
	}

});

/* based on stackoverflow.com/questions/14430633/how-to-convert-text-to-binary-code-in-javascript */
function binToText(str) {
    var str = replaceAll(replaceAll(str, one, "1"), zero, "0");
    if(str.match(/[10]{8}/g)){
        var wordFromBinary = str.match(/([10]{8}|\s+)/g).map(function(fromBinary){
            return String.fromCharCode(parseInt(fromBinary, 2) );
        }).join('');
        return wordFromBinary;
    }
}

/* based on stackoverflow.com/questions/21354235/converting-binary-to-text-using-javascript */
function textToBin(text) {
	var output = '';
  var length = text.length,
      output = [];
  for (var i = 0;i < length; i++) {
    var bin = text[i].charCodeAt().toString(2);
    output.push(Array(8-bin.length+1).join("0") + bin);
  }
  return output.join('');
}

$('#useEncrypt').click(function(){
	if (! this.checked)
	{
		$('#encryptArea').css('display', 'none');
	}
	else
	{
		$('#encryptArea').css('display', 'inherit');
	}
})

function verifyPass(mode)
{
	if ($('#password').val() == '')
	{
		showError('You must provide a password.');
		return false;
	}

	if (mode == 'encrypt')
	{
		if ($('#password').val() != $('#confirmPass').val())
		{
			showError('Passwords must match.');
			return false;
		}
	}
	return true;
}

$('#encode').click(function(){
  go('encode');
});
$('#decode').click(function(){
  go('decode');
});

function go(mode) {
	var output = '';

	var input = $('#text').val();

	if (input == '') { return false; }


	// If we're encoding:
	if (mode == 'encode')
	{
		// If we should use encryption, encrypt first:
		if ($('#useEncrypt').is(':checked'))
		{
			// verify password first
			if (verifyPass('encrypt'))
			{
				input = CryptoJS.AES.encrypt(input, $('#password').val()).toString();
			}
			else
			{
				return false;
			}
		}
		// convert result to binary
		output = textToBin(encodeURIComponent(input));
		$('#output').text(replaceAll(replaceAll(output.toString(), "1", one), "0", zero));
	}
	else
	{
	    var sanitized = "";
	    var split = input.split("");
	    for (var i = 0; i < split.length; i++)
            if(split[i] == one || split[i] == zero)
                sanitized = sanitized + split[i]
		var output = decodeURIComponent(binToText(sanitized));
		if ($('#useEncrypt').is(':checked'))
		{
			if (verifyPass('decrypt'))
			{
				output = CryptoJS.AES.decrypt(output, $('#password').val()).toString(CryptoJS.enc.Utf8);
			}
			else
			{
				return false;
			}
		}
		$('#output').text(output.toString());
	}
	$('#outputModal').modal();
}

$('#clearInputButton').click(function(){
	$('#text').val('');
});
