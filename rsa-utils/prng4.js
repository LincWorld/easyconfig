function Arcfour() {
	this.i = 0;
	this.j = 0;
	this.S = new Array();
}

function ARC4init(a) {
	var b, c, d;
	for (b = 0; b < 256; ++b) this.S[b] = b;
	c = 0;
	for (b = 0; b < 256; ++b) {
		 c = (c + this.S[b] + a[b % a.length]) & 255;
		 d = this.S[b];
		 this.S[b] = this.S[c];
		 this.S[c] = d;
	}
	this.i = 0;
	this.j = 0;
}

function ARC4next() {
	var a;
	this.i = (this.i + 1) & 255;
	this.j = (this.j + this.S[this.i]) & 255;
	a = this.S[this.i];
	this.S[this.i] = this.S[this.j];
	this.S[this.j] = a;
	return this.S[(a + this.S[this.i]) & 255];
}
Arcfour.prototype.init = ARC4init;
Arcfour.prototype.next = ARC4next;

function prng_newstate() {
	return new Arcfour();
}
var rng_psize = 256;
