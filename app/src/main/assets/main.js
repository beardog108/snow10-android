/*
 Snow10 - Whitespace steganography. electronic invisible ink.
    Copyright (C) 2017  Kevin Froman https://ChaosWebs.net/
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
$('#share').click(function(){
console.log(AndroidFunction);
AndroidFunction.share($('#output').val());
$.bootstrapGrowl('shared', {type: 'success'})
});

function split2(str, delim) {
    var parts=str.split(delim);
    return [parts[0], parts.splice(1,parts.length).join(delim)];
}


var clipboard = new Clipboard('.btn');

var zero = '​';
var one = '‍';

var z_zero = '​';
var z_one = '‍';

var w_zero = ' ';
var w_one = '\t';


function byteCountt(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

$('#text').on('input', function(){
   $('#countBytes').text(byteCountt($('#text').val()));
});

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
		output = replaceAll(replaceAll(output.toString(), "1", one), "0", zero);
		coverText = $('#visibleText').val();
        coverText = split2(coverText);
        partOne = coverText[0];
        partTwo = coverText[1];
		$('#output').val(partOne + output + partTwo);
		console.log(partOne + output + partTwo);
	}
	else
	{
	    var sanitized = "";
	    var split = input.split("");
	    for (var i = 0; i < split.length; i++)
            if(split[i] == one || split[i] == zero)
                sanitized = sanitized + split[i]
		var output = decodeURIComponent(binToText(sanitized));
		if (output === 'undefined'){
			showError('Could not decode message. Maybe there wasn\'t one?');
			return false;
		}
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
	$('#countBytes').text('0');
});
