function bnpRShiftTo(a, b) {
	b.s = this.s;
	var c = Math.floor(a / this.DB);
	if (c >= this.t) {
		 b.t = 0;
		 return;
	}
	var d = a % this.DB;
	var e = this.DB - d;
	var f = (1 << d) - 1;
	b[0] = this[c] >> d;
	for (var g = c + 1; g < this.t; ++g) {
		 b[g - c - 1] |= (this[g] & f) << e;
		 b[g - c] = this[g] >> d;
	}
	if (d > 0) b[this.t - c - 1] |= (this.s & f) << e;
	b.t = this.t - c;
	b.clamp();
}

function bnpSubTo(a, b) {
	var c = 0,
		 d = 0,
		 e = Math.min(a.t, this.t);
	while (c < e) {
		 d += this[c] - a[c];
		 b[c++] = d & this.DM;
		 d >>= this.DB;
	}
	if (a.t < this.t) {
		 d -= a.s;
		 while (c < this.t) {
			  d += this[c];
			  b[c++] = d & this.DM;
			  d >>= this.DB;
		 }
		 d += this.s;
	} else {
		 d += this.s;
		 while (c < a.t) {
			  d -= a[c];
			  b[c++] = d & this.DM;
			  d >>= this.DB;
		 }
		 d -= a.s;
	}
	b.s = (d < 0) ? -1 : 0;
	if (d < -1) b[c++] = this.DV + d;
	else if (d > 0) b[c++] = d;
	b.t = c;
	b.clamp();
}

function bnpMultiplyTo(a, b) {
	var c = this.abs(),
		 d = a.abs();
	var e = c.t;
	b.t = e + d.t;
	while (--e >= 0) b[e] = 0;
	for (e = 0; e < d.t; ++e) b[e + c.t] = c.am(0, d[e], b, e, 0, c.t);
	b.s = 0;
	b.clamp();
	if (this.s != a.s) BigInteger.ZERO.subTo(b, b);
}

function bnpSquareTo(a) {
	var b = this.abs();
	var c = a.t = 2 * b.t;
	while (--c >= 0) a[c] = 0;
	for (c = 0; c < b.t - 1; ++c) {
		 var d = b.am(c, b[c], a, 2 * c, 0, 1);
		 if ((a[c + b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, d, b.t - c - 1)) >= b.DV) {
			  a[c + b.t] -= b.DV;
			  a[c + b.t + 1] = 1;
		 }
	}
	if (a.t > 0) a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1);
	a.s = 0;
	a.clamp();
}

function bnpDivRemTo(a, b, c) {
	var d = a.abs();
	if (d.t <= 0) return;
	var e = this.abs();
	if (e.t < d.t) {
		 if (b != null) b.fromInt(0);
		 if (c != null) this.copyTo(c);
		 return;
	}
	if (c == null) c = nbi();
	var f = nbi(),
		 g = this.s,
		 h = a.s;
	var i = this.DB - nbits(d[d.t - 1]);
	if (i > 0) {
		 d.lShiftTo(i, f);
		 e.lShiftTo(i, c);
	} else {
		 d.copyTo(f);
		 e.copyTo(c);
	}
	var j = f.t;
	var k = f[j - 1];
	if (k == 0) return;
	var l = k * (1 << this.F1) + ((j > 1) ? f[j - 2] >> this.F2 : 0);
	var m = this.FV / l,
		 n = (1 << this.F1) / l,
		 o = 1 << this.F2;
	var p = c.t,
		 q = p - j,
		 r = (b == null) ? nbi() : b;
	f.dlShiftTo(q, r);
	if (c.compareTo(r) >= 0) {
		 c[c.t++] = 1;
		 c.subTo(r, c);
	}
	BigInteger.ONE.dlShiftTo(j, r);
	r.subTo(f, f);
	while (f.t < j) f[f.t++] = 0;
	while (--q >= 0) {
		 var s = (c[--p] == k) ? this.DM : Math.floor(c[p] * m + (c[p - 1] + o) * n);
		 if ((c[p] += f.am(0, s, c, q, 0, j)) < s) {
			  f.dlShiftTo(q, r);
			  c.subTo(r, c);
			  while (c[p] < --s) c.subTo(r, c);
		 }
	}
	if (b != null) {
		 c.drShiftTo(j, b);
		 if (g != h) BigInteger.ZERO.subTo(b, b);
	}
	c.t = j;
	c.clamp();
	if (i > 0) c.rShiftTo(i, c);
	if (g < 0) BigInteger.ZERO.subTo(c, c);
}

function bnMod(a) {
	var b = nbi();
	this.abs().divRemTo(a, null, b);
	if (this.s < 0 && b.compareTo(BigInteger.ZERO) > 0) a.subTo(b, b);
	return b;
}

function Classic(a) {
	this.m = a;
}

function cConvert(a) {
	if (a.s < 0 || a.compareTo(this.m) >= 0) return a.mod(this.m);
	else return a;
}

function cRevert(a) {
	return a;
}

function cReduce(a) {
	a.divRemTo(this.m, null, a);
}

function cMulTo(a, b, c) {
	a.multiplyTo(b, c);
	this.reduce(c);
}

function cSqrTo(a, b) {
	a.squareTo(b);
	this.reduce(b);
}
Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

function bnpInvDigit() {
	if (this.t < 1) return 0;
	var a = this[0];
	if ((a & 1) == 0) return 0;
	var b = a & 3;
	b = (b * (2 - (a & 0xf) * b)) & 0xf;
	b = (b * (2 - (a & 0xff) * b)) & 0xff;
	b = (b * (2 - (((a & 0xffff) * b) & 0xffff))) & 0xffff;
	b = (b * (2 - a * b % this.DV)) % this.DV;
	return (b > 0) ? this.DV - b : -b;
}

function Montgomery(a) {
	this.m = a;
	this.mp = a.invDigit();
	this.mpl = this.mp & 0x7fff;
	this.mph = this.mp >> 15;
	this.um = (1 << (a.DB - 15)) - 1;
	this.mt2 = 2 * a.t;
}

function montConvert(a) {
	var b = nbi();
	a.abs().dlShiftTo(this.m.t, b);
	b.divRemTo(this.m, null, b);
	if (a.s < 0 && b.compareTo(BigInteger.ZERO) > 0) this.m.subTo(b, b);
	return b;
}

function montRevert(a) {
	var b = nbi();
	a.copyTo(b);
	this.reduce(b);
	return b;
}

function montReduce(a) {
	while (a.t <= this.mt2) a[a.t++] = 0;
	for (var b = 0; b < this.m.t; ++b) {
		 var c = a[b] & 0x7fff;
		 var d = (c * this.mpl + (((c * this.mph + (a[b] >> 15) * this.mpl) & this.um) << 15)) & a.DM;
		 c = b + this.m.t;
		 a[c] += this.m.am(0, d, a, b, 0, this.m.t);
		 while (a[c] >= a.DV) {
			  a[c] -= a.DV;
			  a[++c]++;
		 }
	}
	a.clamp();
	a.drShiftTo(this.m.t, a);
	if (a.compareTo(this.m) >= 0) a.subTo(this.m, a);
}

function montSqrTo(a, b) {
	a.squareTo(b);
	this.reduce(b);
}

function montMulTo(a, b, c) {
	a.multiplyTo(b, c);
	this.reduce(c);
}
Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

function bnpIsEven() {
	return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
}

function bnpExp(a, b) {
	if (a > 0xffffffff || a < 1) return BigInteger.ONE;
	var c = nbi(),
		 d = nbi(),
		 e = b.convert(this),
		 f = nbits(a) - 1;
	e.copyTo(c);
	while (--f >= 0) {
		 b.sqrTo(c, d);
		 if ((a & (1 << f)) > 0) b.mulTo(d, e, c);
		 else {
			  var g = c;
			  c = d;
			  d = g;
		 }
	}
	return b.revert(c);
}

function bnModPowInt(a, b) {
	var c;
	if (a < 256 || b.isEven()) c = new Classic(b);
	else c = new Montgomery(b);
	return this.exp(a, c);
}
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
