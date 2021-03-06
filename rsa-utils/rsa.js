function parseBigInt(a, b) {
	return new BigInteger(a, b);
}

function linebrk(a, b) {
	var c = '';
	var d = 0;
	while (d + b < a.length) {
		 c += a.substring(d, d + b) + '\\n';
		 d += b;
	}
	return c + a.substring(d, a.length);
}

function byte2Hex(a) {
	if (a < 0x10) return '0' + a.toString(16);
	else return a.toString(16);
}

function pkcs1pad2(a, b) {
	if (b < a.length + 11) {
		 alert('Message too long for RSA');
		 return null;
	}
	var c = new Array();
	var d = a.length - 1;
	while (d >= 0 && b > 0) {
		 var e = a.charCodeAt(d--);
		 if (e < 128) c[--b] = e;
		 else if ((e > 127) && (e < 2048)) {
			  c[--b] = (e & 63) | 128;
			  c[--b] = (e >> 6) | 192;
		 } else {
			  c[--b] = (e & 63) | 128;
			  c[--b] = ((e >> 6) & 63) | 128;
			  c[--b] = (e >> 12) | 224;
		 }
	}
	c[--b] = 0;
	var f = new SecureRandom();
	var g = new Array();
	while (b > 2) {
		 g[0] = 0;
		 while (g[0] == 0) f.nextBytes(g);
		 c[--b] = g[0];
	}
	c[--b] = 2;
	c[--b] = 0;
	return new BigInteger(c);
}

function RSAKey() {
	this.n = null;
	this.e = 0;
	this.d = null;
	this.p = null;
	this.q = null;
	this.dmp1 = null;
	this.dmq1 = null;
	this.coeff = null;
}

function RSASetPublic(a, b) {
	if (a != null && b != null && a.length > 0 && b.length > 0) {
		 this.n = parseBigInt(a, 16);
		 this.e = parseInt(b, 16);
	} else alert('Invalid RSA public key');
}

function RSADoPublic(a) {
	return a.modPowInt(this.e, this.n);
}

function RSAEncrypt(a) {
	var b = pkcs1pad2(a, (this.n.bitLength() + 7) >> 3);
	if (b == null) return null;
	var c = this.doPublic(b);
	if (c == null) return null;
	var d = c.toString(16);
	if ((d.length & 1) == 0) return d;
	else return '0' + d;
}
RSAKey.prototype.doPublic = RSADoPublic;
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
