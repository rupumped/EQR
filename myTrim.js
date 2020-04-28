/**
 * Trim() for more than just whitespace.
 *
 * Removes any substrings matching a given regular expression from both sides of a string.
 *
 * @param  {string}	s  String to be trimmed.
 * @param  {string} c  Regular expression to trimmed.
 * @return {string}    Trimmed string.
 */
function myTrim(s, c) {
	c = '(?:'+c+')';
	return s.replace(new RegExp('^'+c+'+|'+c+'+$','gm'),'');
}