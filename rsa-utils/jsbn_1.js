var dbits;
var canary = 0xdeadbeefcafe;
var j_lm = ((canary & 0xffffff) == 0xefcafe);

function BigInteger(a, b, c) {
    if (a != null)
        if ('number' == typeof a) this.fromNumber(a, b, c);
        else if (b == null && 'string' != typeof a) this.fromString(a, 256);
    else this.fromString(a, b);
}

function nbi() {
    return new BigInteger(null);
}

function am1(a, b, c, d, e, f) {
    while (--f >= 0) {
        var g = b * this[a++] + c[d] + e;
        e = Math.floor(g / 0x4000000);
        c[d++] = g & 0x3ffffff;
    }
    return e;
}

function am2(a, b, c, d, e, f) {
    var g = b & 0x7fff,
        h = b >> 15;
    while (--f >= 0) {
        var i = this[a] & 0x7fff;
        var j = this[a++] >> 15;
        var k = h * i + j * g;
        i = g * i + ((k & 0x7fff) << 15) + c[d] + (e & 0x3fffffff);
        e = (i >>> 30) + (k >>> 15) + h * j + (e >>> 30);
        c[d++] = i & 0x3fffffff;
    }
    return e;
}

function am3(a, b, c, d, e, f) {
    var g = b & 0x3fff,
        h = b >> 14;
    while (--f >= 0) {
        var i = this[a] & 0x3fff;
        var j = this[a++] >> 14;
        var k = h * i + j * g;
        i = g * i + ((k & 0x3fff) << 14) + c[d] + e;
        e = (i >> 28) + (k >> 14) + h * j;
        c[d++] = i & 0xfffffff;
    }
    return e;
}
if (j_lm && (navigator.appName == 'Microsoft Internet Explorer')) {
    BigInteger.prototype.am = am2;
    dbits = 30;
} else if (j_lm && (navigator.appName != 'Netscape')) {
    BigInteger.prototype.am = am1;
    dbits = 26;
} else {
    BigInteger.prototype.am = am3;
    dbits = 28;
}
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1 << dbits) - 1);
BigInteger.prototype.DV = (1 << dbits);
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP);
BigInteger.prototype.F1 = BI_FP - dbits;
BigInteger.prototype.F2 = 2 * dbits - BI_FP;
var BI_RM = '0123456789abcdefghijklmnopqrstuvwxyz';
var BI_RC = new Array();
var rr, vv;
rr = '0'.charCodeAt(0);
for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = 'a'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = 'A'.charCodeAt(0);
for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(a) {
    return BI_RM.charAt(a);
}

function intAt(a, b) {
    var c = BI_RC[a.charCodeAt(b)];
    return (c == null) ? -1 : c;
}

function bnpCopyTo(a) {
    for (var b = this.t - 1; b >= 0; --b) a[b] = this[b];
    a.t = this.t;
    a.s = this.s;
}

function bnpFromInt(a) {
    this.t = 1;
    this.s = (a < 0) ? -1 : 0;
    if (a > 0) this[0] = a;
    else if (a < -1) this[0] = a + this.DV;
    else this.t = 0;
}

function nbv(a) {
    var b = nbi();
    b.fromInt(a);
    return b;
}

function bnpFromString(a, b) {
    var c;
    if (b == 16) c = 4;
    else if (b == 8) c = 3;
    else if (b == 256) c = 8;
    else if (b == 2) c = 1;
    else if (b == 32) c = 5;
    else if (b == 4) c = 2;
    else {
        this.fromRadix(a, b);
        return;
    }
    this.t = 0;
    this.s = 0;
    var d = a.length,
        e = false,
        f = 0;
    while (--d >= 0) {
        var g = (c == 8) ? a[d] & 0xff : intAt(a, d);
        if (g < 0) {
            if (a.charAt(d) == '-') e = true;
            continue;
        }
        e = false;
        if (f == 0) this[this.t++] = g;
        else if (f + c > this.DB) {
            this[this.t - 1] |= (g & ((1 << (this.DB - f)) - 1)) << f;
            this[this.t++] = (g >> (this.DB - f));
        } else this[this.t - 1] |= g << f;
        f += c;
        if (f >= this.DB) f -= this.DB;
    }
    if (c == 8 && (a[0] & 0x80) != 0) {
        this.s = -1;
        if (f > 0) this[this.t - 1] |= ((1 << (this.DB - f)) - 1) << f;
    }
    this.clamp();
    if (e) BigInteger.ZERO.subTo(this, this);
}

function bnpClamp() {
    var a = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == a) --this.t;
}

function bnToString(a) {
    if (this.s < 0) return '-' + this.negate().toString(a);
    var b;
    if (a == 16) b = 4;
    else if (a == 8) b = 3;
    else if (a == 2) b = 1;
    else if (a == 32) b = 5;
    else if (a == 4) b = 2;
    else return this.toRadix(a);
    var c = (1 << b) - 1,
        d, e = false,
        f = '',
        g = this.t;
    var h = this.DB - (g * this.DB) % b;
    if (g-- > 0) {
        if (h < this.DB && (d = this[g] >> h) > 0) {
            e = true;
            f = int2char(d);
        }
        while (g >= 0) {
            if (h < b) {
                d = (this[g] & ((1 << h) - 1)) << (b - h);
                d |= this[--g] >> (h += this.DB - b);
            } else {
                d = (this[g] >> (h -= b)) & c;
                if (h <= 0) {
                    h += this.DB;
                    --g;
                }
            }
            if (d > 0) e = true;
            if (e) f += int2char(d);
        }
    }
    return e ? f : '0';
}

function bnNegate() {
    var a = nbi();
    BigInteger.ZERO.subTo(this, a);
    return a;
}

function bnAbs() {
    return (this.s < 0) ? this.negate() : this;
}

function bnCompareTo(a) {
    var b = this.s - a.s;
    if (b != 0) return b;
    var c = this.t;
    b = c - a.t;
    if (b != 0) return (this.s < 0) ? -b : b;
    while (--c >= 0)
        if ((b = this[c] - a[c]) != 0) return b;
    return 0;
}

function nbits(a) {
    var b = 1,
        c;
    if ((c = a >>> 16) != 0) {
        a = c;
        b += 16;
    }
    if ((c = a >> 8) != 0) {
        a = c;
        b += 8;
    }
    if ((c = a >> 4) != 0) {
        a = c;
        b += 4;
    }
    if ((c = a >> 2) != 0) {
        a = c;
        b += 2;
    }
    if ((c = a >> 1) != 0) {
        a = c;
        b += 1;
    }
    return b;
}

function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
}

function bnpDLShiftTo(a, b) {
    var c;
    for (c = this.t - 1; c >= 0; --c) b[c + a] = this[c];
    for (c = a - 1; c >= 0; --c) b[c] = 0;
    b.t = this.t + a;
    b.s = this.s;
}

function bnpDRShiftTo(a, b) {
    for (var c = a; c < this.t; ++c) b[c - a] = this[c];
    b.t = Math.max(this.t - a, 0);
    b.s = this.s;
}

function bnpLShiftTo(a, b) {
    var c = a % this.DB;
    var d = this.DB - c;
    var e = (1 << d) - 1;
    var f = Math.floor(a / this.DB),
        g = (this.s << c) & this.DM,
        h;
    for (h = this.t - 1; h >= 0; --h) {
        b[h + f + 1] = (this[h] >> d) | g;
        g = (this[h] & e) << c;
    }
    for (h = f - 1; h >= 0; --h) b[h] = 0;
    b[f] = g;
    b.t = this.t + f + 1;
    b.s = this.s;
    b.clamp();
}
