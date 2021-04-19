import Cartesian2 from "../Core/Cartesian2"

var SMAAStage3 = {

	uniformMap: {

		'tDiffuse': { value: null },
		'tColor': { value: null },
		'resolution': function() {
			return new Cartesian2( 1 / 1024, 1 / 512 ) 
		}

	},

	vertexShader: [
		'attribute vec2 uv;',
		'attribute vec3 position;',
		'uniform vec2 resolution;',

		'varying vec2 vUv;',
		'varying vec4 vOffset[ 2 ];',

		'void SMAANeighborhoodBlendingVS( vec2 texcoord ) {',
		'	vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );', // WebGL port note: Changed sign in W component
		'	vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );', // WebGL port note: Changed sign in W component
		'}',

		'void main() {',

		'	vUv = uv;',

		'	SMAANeighborhoodBlendingVS( vUv );',

		'	gl_Position = vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tColor;',
		'uniform vec2 resolution;',

		'varying vec2 vUv;',
		'varying vec4 vOffset[ 2 ];',

		'vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {',
		// Fetch the blending weights for current pixel:
		'	vec4 a;',
		'	a.xz = texture2D( blendTex, texcoord ).xz;',
		'	a.y = texture2D( blendTex, offset[ 1 ].zw ).g;',
		'	a.w = texture2D( blendTex, offset[ 1 ].xy ).a;',

		// Is there any blending weight with a value greater than 0.0?
		'	if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {',
		'		return texture2D( colorTex, texcoord, 0.0 );',
		'	} else {',
		// Up to 4 lines can be crossing a pixel (one through each edge). We
		// favor blending by choosing the line with the maximum weight for each
		// direction:
		'		vec2 offset;',
		'		offset.x = a.a > a.b ? a.a : -a.b;', // left vs. right
		'		offset.y = a.g > a.r ? -a.g : a.r;', // top vs. bottom // WebGL port note: Changed signs

		// Then we go in the direction that has the maximum weight:
		'		if ( abs( offset.x ) > abs( offset.y )) {', // horizontal vs. vertical
		'			offset.y = 0.0;',
		'		} else {',
		'			offset.x = 0.0;',
		'		}',

		// Fetch the opposite color and lerp by hand:
		'		vec4 C = texture2D( colorTex, texcoord, 0.0 );',
		'		texcoord += sign( offset ) * resolution;',
		'		vec4 Cop = texture2D( colorTex, texcoord, 0.0 );',
		'		float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );',

		// WebGL port note: Added gamma correction
		'		C.xyz = pow(C.xyz, vec3(2.2));',
		'		Cop.xyz = pow(Cop.xyz, vec3(2.2));',
		'		vec4 mixed = mix(C, Cop, s);',
		'		mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));',

		'		return mixed;',
		'	}',
		'}',

		'void main() {',

		'	gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );',

		'}'

	].join( '\n' )

};

export default SMAAStage3;
