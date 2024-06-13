// ! ADD THESE TWO TO THE 'parsers.js' (v0.2):
export function TokenSource(token) {
	return {
		value: token,
		concat: function (plus) {
			return TokenSource({ ...token, value: token.value.concat(plus.value) })
		}
	}
}
