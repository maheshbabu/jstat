// Special functions //
(function( jStat, Math ) {

// extending static jStat methods
jStat.extend({

	// Log-gamma function
	gammaln : function( x ) {
		var j = 0,
			cof = [
				76.18009172947146, -86.50532032941677, 24.01409824083091,
				-1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
			],
			xx, y, tmp, ser;
		tmp = ( y = xx = x ) + 5.5;
		tmp -= ( xx + 0.5 ) * Math.log( tmp );
		ser = 1.000000000190015;
		for( ; j < 6; j++ ) ser += cof[j] / ++y;
		return Math.log( 2.5066282746310005 * ser / xx) - tmp;
	},

	// gamma of x
	gammafn : function( x ) {
		var p = [
				-1.716185138865495, 24.76565080557592, -379.80425647094563,
				629.3311553128184, 866.9662027904133, -31451.272968848367,
				-36144.413418691176, 66456.14382024054
			],
			q = [
				-30.8402300119739, 315.35062697960416, -1015.1563674902192,
				-3107.771671572311, 22538.118420980151, 4755.8462775278811,
				-134659.9598649693, -115132.2596755535
			],
			fact = false,
			n = 0,
			xden = 0,
			xnum = 0,
			y = x,
			i, z, yi, res, sum, ysq;

		if( y <= 0 ) {
			res = y % 1 + 3.6e-16;
			if ( res ) {
				fact = (!( y & 1 ) ? 1 : -1 ) * Math.PI / Math.sin( Math.PI * res );
				y = 1 - y;
			} else {
				return Infinity;
			}
		}

		yi = y;
		
		if ( y < 1 ) {
			z = y++;
		} else {
			z = ( y -= n = ( y | 0 ) - 1 ) - 1;
		}

		for ( i = 0; i < 8; ++i ) {
			xnum = ( xnum + p[i] ) * z;
			xden = xden * z + q[i];
		}
		
		res = xnum / xden + 1;
		
		if ( yi < y ) {
			res /= yi;
		} else if ( yi > y ) {
			for ( i = 0; i < n; ++i ) {
				res *= y;
				y++;
			}
		}

		if ( fact ) {
			res = fact / res;
		}
		return res;
	},
	
	// lower incomplete gamma function P(a,x)
	gammap : function( a, x ) {

		var ITMAX = Math.ceil( Math.log( a ) * 8.5 + a * 0.4 + 17 ),
			aln = jStat.gammaln( a ),
			afn = jStat.gammafn( a ),
			ap = a,
			sum = 1 / a,
			del = sum,
			b = x + 1 - a,
			c = 1 / 1.0e-30,
			d = 1 / b,
			h = d,
			i = 1,
			an, endval;

		if ( x < 0 || a <= 0 ) {
			return NaN;
		} else if ( x < a + 1 ) {
			for ( ; i <= ITMAX; i++ ) {
				sum += del *= x / ++ap;
			}
			endval = sum * Math.exp( -x + a * Math.log( x ) - ( aln ));
		} else {
			for ( ; i <= ITMAX; i++ ) {
				an = -i * ( i - a );
				b += 2;
				d = an * d + b;
				c = b + an / c;
				d = 1 / d;
				h *= d * c;
			}
			endval = 1 - h * Math.exp( -x + a * Math.log( x ) - ( aln ));
		}

		return endval * afn;
	},

	// natural log factorial of n
	factorialln : function( n ) {
		return n < 0 ? NaN : jStat.gammaln( n + 1 );
	},

	// factorial of n
	factorial : function( n ) {
		return n < 0 ? NaN : jStat.gammafn( n + 1 );
	},

	// combinations of n, m
	combination : function( n, m ) {
		return ( jStat.factorial( n ) / jStat.factorial( m )) / jStat.factorial( n - m );
	},

	// permutations of n, m
	permutation : function( n, m ) {
		return jStat.factorial( n ) / jStat.factorial( n - m );
	},

	// beta function
	betafn : function( x, y ) {
		return jStat.gammafn( x ) * jStat.gammafn( y ) / jStat.gammafn( x + y );
	}

});

// making use of static methods on the instance
(function( funcs ) {
	for ( var i = 0; i < funcs.length; i++ ) (function( passfunc ) {
		jStat.fn[ passfunc ] = function() {
			return jStat( jStat.map( this, function( value ) { return jStat[ passfunc ]( value ); }));
		};
	})( funcs[i] );
})( 'gammaln gammafn factorial factorialln'.split( ' ' ));



// unrevised code beneath this line //

jStat.extend({

	// Returns the inverse incomplte gamma function
	gammapInv : function( p, a ) {
		var j = 0,x,gln,err,t,u,pp,lna1,afac,a1=a-1,EPS=1e-8;
		gln = jStat.gammaln( a );

//		if( a <= 0 ) xerror();
		if( p >= 1 ) return Math.max( 100, a + 100 * Math.sqrt( a ) );
		if( p <= 0 ) return 0;
		if( a > 1 ) {
			lna1 = Math.log( a1 );
			afac = Math.exp( a1 * ( lna1 - 1 ) - gln );
			pp = ( p < 0.5 ) ? p : 1 - p;
			t = Math.sqrt( -2 * Math.log( pp ) );
			x = ( 2.30753 + t * 0.27061 ) / ( 1 + t * ( 0.99229 + t * 0.04481 ) );
			if( p < 0.5 ) x = -x;
			x = Math.max( 1e-3, a * Math.pow( 1 - 1 / ( 9 * a ) - x / ( 3 * Math.sqrt( a ) ), 3 ) );
		} else {
			t = 1 - a * ( 0.253 + a * 0.12 );
			if( p < t ) x = Math.pow( p / t, 1 / a);
			else x = 1 -Math.log( 1 - ( p - t ) / ( 1 - t ) );
		}

		for( ; j < 12; j++ ) {
			if( x <= 0 ) return 0;
			err = jStat.gammap( x, a ) - p;
			if( a > 1 ) t = afac * Math.exp( -( x - a1 ) + a1 * ( Math.log( x ) - lna1 ) );
			else t = Math.exp( -x + a1 * Math.log( x ) - gln );
			u = err / t;
			x -= ( t = u / ( 1 - 0.5 * Math.min(1, u * ( ( a - 1 ) / x - 1 ) ) ) );
			if( x <= 0 ) x = 0.5 * ( x + t );
			if( Math.abs( t ) < EPS * x ) break;
		}
		return x;
	},

	// Returns the error function erf(x)
	erf : function( x ) {
		if( isNaN( x ) ) {
			// run for all values in matrix
			return x.map( function( value ) {return jStat.erf( value );} );
		}

		var cof = [
			-1.3026537197817094,
			6.4196979235649026e-1,
			1.9476473204185836e-2,
			-9.561514786808631e-3,
			-9.46595344482036e-4,
			3.66839497852761e-4,
			4.2523324806907e-5,
			-2.0278578112534e-5,
			-1.624290004647e-6,
			1.303655835580e-6,
			1.5626441722e-8,
			-8.5238095915e-8,
			6.529054439e-9,
			5.059343495e-9,
			-9.91364156e-10,
			-2.27365122e-10,
			9.6467911e-11,
			2.394038e-12,
			-6.886027e-12,
			8.94487e-13,
			3.13092e-13,
			-1.12708e-13,
			3.81e-16,
			7.106e-15,
			-1.523e-15,
			-9.4e-17,
			1.21e-16,
			-2.8e-17
		],
		j = cof.length - 1, t, ty, tmp, d = 0, dd = 0,res,isneg = false;

		if( x < 0 ) {
			x = -x;
			isneg = true;
		}

		t = 2 / ( 2 + x );
		ty = 4 * t - 2;
		for( ; j > 0; j-- ) {
			tmp = d;
			d = ty * d - dd + cof[j];
			dd = tmp;
		}

		res = t * Math.exp( -x*x + 0.5 * ( cof[0] + ty * d ) - dd );
		return ( isneg ) ? res - 1 : 1 - res;
	},

	// Returns the complmentary error function erfc(x)
	erfc : function( x ) {
		if( isNaN( x ) ) {
			// run for all values in matrix
			return x.map( function( value ) {return jStat.erfc( value );} );
		}

		return 1 - jStat.erf( x );
	},

	// Returns the inverse of the complementary error function
	erfcinv : function( p ) {
		if( isNaN( p ) ) {
			return p.map( function( value ) {return jStat.erfcinv( value );} );
		}

		var x, err, t, pp, j = 0;

		if( p >= 2 ) return -100;
		if( p <= 0 ) return 100;

		pp = ( p < 1 ) ? p : 2 - p;

		t = Math.sqrt( -2 * Math.log( pp / 2 ) );
		x = -0.70711 * ( ( 2.30753 + t * 0.27061 ) / ( 1 + t * ( 0.99229 + t * 0.04481) ) - t );

		for( ; j < 2; j++ ) {
			err = jStat.erfc( x ) - pp;
			x += err / ( 1.12837916709551257 * Math.exp( -x*x ) - x * err );
		}

		return ( p < 1 ) ? x : -x;
	},


	// Returns the inverse of the incomplete beta function
	incompleteBetaInv : function( p, a, b ) {

		if( isNaN( p ) ) {
			// run for all values in matrix
			return p.map( function( value ) {return jStat.incompleteBetaInv( value, a, b );} );
		}

		var EPS = 1e-8, pp, t, u, err, x, al, h, w, afac, a1=a-1, b1=b-1,j=0,lna,lnb;

		if( p <= 0 ) return 0;
		else if( p >= 1 ) return 1;
		else if( a >= 1 && b >= 1 ) {
			pp = ( p < 0.5 ) ? p : 1 - p;
			t = Math.sqrt( -2 * Math.log( pp ) );
			x = ( 2.30753 + t * 0.27061 ) / ( 1 + t* ( 0.99229 + t * 0.04481 ) ) - t;
			if( p < 0.5 ) x = -x;
			al = ( x*x -3 ) / 6;
			h = 2 / ( 1 / ( 2 * a - 1 )  + 1 / ( 2 * b - 1 ) );
			w = ( x * Math.sqrt( al + h ) / h ) - ( 1 / ( 2 * b - 1 ) - 1 / ( 2 * a - 1 ) ) * ( al + 5 / 6 - 2 / ( 3 * h ) );
			x = a / ( a + b * Math.exp( 2 * w ) );
		} else {
			lna = Math.log( a / ( a + b ) );
			lnb = Math.log( b / ( a + b ) );
			t = Math.exp( a * lna ) / a;
			u = Math.exp( b * lnb ) / b;
			w = t + u;
			if( p < t / w) x = Math.pow( a*w*p, 1 / a );
			else x = 1 - Math.pow( b*w*( 1 - p ), 1 / b);
		}
		afac = -jStat.gammaln( a ) - jStat.gammaln( b ) + jStat.gammaln( a + b );
		for( ; j < 10; j++ ) {
			if( x === 0 || x === 1) return x;
			err = jStat.incompleteBeta( x, a, b ) - p;
			t = Math.exp( a1 * Math.log( x ) + b1 * Math.log( 1 - x ) + afac );
			u = err / t;
			x -= ( t = u / ( 1 - 0.5 * Math.min( 1, u * ( a1 / x - b1 / ( 1 - x ) ) ) ) );
			if( x <= 0 ) x = 0.5 * ( x + t );
			if( x >= 1 ) x = 0.5 * ( x + t + 1 );
			if( Math.abs( t ) < EPS * x && j > 0 ) break;
		}
		return x;
	},

	// Returns the incomplete beta function I_x(a,b)
	incompleteBeta : function( x, a, b ) {

		if( isNaN( x ) ) {
			// run for all values in matrix
			return x.map( function( value ) {return jStat.incompleteBeta( value, a, b );} );
		}

		// Evaluates the continued fraction for incomplete beta function
		// by modified Lentz's method.
		function betacf( x, a, b ) {
			// TODO: make fpmin constant?
			var m = 1, m2, aa, c, d, del, h, qab, qam, qap, fpmin = 1e-30;

			// These q's will be used in factors that occur in the coefficients
			qab = a + b;
			qap = a + 1;
			qam = a - 1;

			c = 1;
			d = 1 - qab * x / qap;

			if( Math.abs( d ) < fpmin ) d = fpmin;

			d = 1 / d;
			h = d;

			// TODO: replace 100 with MAXIT constant
			for ( ; m <= 100; m++ ) {
				m2 = 2 * m;
				aa = m * ( b - m ) * x / ( ( qam + m2 ) * ( a + m2 ) );
				d = 1 + aa * d;	// One step (the even one) of the recurrence

				// TODO: Make precision check function?
				if( Math.abs( d ) < fpmin ) d = fpmin;

				c = 1 + aa / c;

				if( Math.abs( c ) < fpmin ) c = fpmin;

				d = 1 / d;
				h *= d * c;
				aa = -( a + m ) * ( qab + m ) * x / ( ( a + m2 ) * ( qap + m2 ) );
				d = 1 + aa * d;	// Next step of the recurrence (the odd one)

				if( Math.abs( d ) < fpmin ) d = fpmin;

				c = 1 + aa / c;

				if( Math.abs( c ) < fpmin ) c = fpmin;

				d = 1 / d;
				del = d * c;
				h *= del;

				// TODO: make 3e-7 a constant
				if( Math.abs( del - 1.0 ) < 3e-7 ) break;	// Are we done?
			}

			return h;
		}

		if( x < 0 || x > 1 ) return false;

		var bt = ( x === 0 || x === 1 ) ?  0 :
			Math.exp(jStat.gammaln( a + b ) - jStat.gammaln( a ) -
			jStat.gammaln( b ) + a * Math.log( x ) + b *
			Math.log( 1 - x ));	// Factors in front of the continued fraction.

		if( x < ( a + 1 ) / ( a + b + 2 ) )
			// Use continued fraction directly.
			return bt * betacf( x, a, b ) / a;

		// else use continued fraction after making the symmetry transformation.
		return 1 - bt * betacf( 1 - x, b, a ) / b;

	},

	// Returns a normal deviate (mu=0, sigma=1).
	// If n and m are specified it returns a jstat object of normal deviates.
	randn : function( n, m ) {
		m = m || n;

		var u, v, x, y, q, mat;

		if( n ) {
			mat = jStat.zeros( n,m );
			mat.alter(function() {return jStat.randn();} );
			return mat;
		}

		do {
			u = Math.random();
			v = 1.7156 * ( Math.random() - 0.5 );
			x = u - 0.449871;
			y = Math.abs( v ) + 0.386595;
			q = x*x + y * ( 0.19600 * y - 0.25472 * x );
		} while( q > 0.27597 && ( q > 0.27846 || v*v > -4 * Math.log( u ) * u*u ) );

		return v / u;
	},

	// Returns a gamma deviate by the method of Marsaglia and Tsang.
	randg : function( shape, n, m ) {
		m = m || n;
		shape = shape || 1;
		if( n ) {
			var mat = jStat.zeros( n,m );
			mat.alter(function() {return jStat.randg( shape );} );
			return mat;
		}

		var a1, a2, oalph = shape, u, v, x;

//		if( shape <= 0 ) xerror();

		if( shape < 1 ) shape += 1;

		a1 = shape - 1 / 3;
		a2 = 1 / Math.sqrt( 9 * a1 );

		do {
			do {
				x = jStat.randn();
				v = 1 + a2 * x;
			} while( v <= 0 );
			v = v*v*v;
			u = Math.random();
		} while( u > 1 - 0.331 * Math.pow( x, 4 ) &&
			Math.log( u ) > 0.5 * x*x + a1 * ( 1 - v + Math.log( v ) ));

		// alpha > 1
		if( shape == oalph ) return a1 * v;

		// alpha < 1
		do { u = Math.random(); } while( u === 0 );

		return Math.pow( u, 1 / oalph ) * a1 * v;
	}
});

})( this.jStat, Math );
