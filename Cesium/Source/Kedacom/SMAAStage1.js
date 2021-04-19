import Cartesian2 from "../Core/Cartesian2"

var SMAAStage1 = {
	uniformMap: {

		'tDiffuse': undefined,
		'resolution': function() {
			return new Cartesian2( 1 / 1024, 1 / 512 ) 
		}

	},

	vertexShader: [
		'attribute vec2 uv;',
  		'attribute vec3 position;',
  		'uniform vec2 resolution;',

  		'varying vec2 vUv;',
      'varying vec4 vOffset0;',
      'varying vec4 vOffset1;',
      'varying vec4 vOffset2;',

  		'void SMAAEdgeDetectionVS( vec2 texcoord ) {',
  		'	vOffset0 = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );', // WebGL port note: Changed sign in W component
  		'	vOffset1 = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );', // WebGL port note: Changed sign in W component
  		'	vOffset2 = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );', // WebGL port note: Changed sign in W component
  		'}',

  		'void main() {',

  		'	vUv = uv;',

  		'	SMAAEdgeDetectionVS( vUv );',

  		'	gl_Position = vec4( position, 1.0 );',

  		'}'

	].join( '\n' ),

	fragmentShader: [
		
		'uniform sampler2D tDiffuse;',

  		'varying vec2 vUv;',
  		'varying vec4 vOffset0;',
      'varying vec4 vOffset1;',
      'varying vec4 vOffset2;',

  		'vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset0, vec4 offset1, vec4 offset2, sampler2D colorTex ) {',
  		'	vec2 threshold = vec2( 0.1, 0.1 );',

  		// Calculate color deltas:
  		'	vec4 delta;',
  		'	vec3 C = texture2D( colorTex, texcoord ).rgb;',

  		'	vec3 Cleft = texture2D( colorTex, offset0.xy ).rgb;',
  		'	vec3 t = abs( C - Cleft );',
  		'	delta.x = max( max( t.r, t.g ), t.b );',

  		'	vec3 Ctop = texture2D( colorTex, offset0.zw ).rgb;',
  		'	t = abs( C - Ctop );',
  		'	delta.y = max( max( t.r, t.g ), t.b );',

  		// We do the usual threshold:
  		'	vec2 edges = step( threshold, delta.xy );',

  		// Then discard if there is no edge:
  		'	if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )',
  		'		discard;',

  		// Calculate right and bottom deltas:
  		'	vec3 Cright = texture2D( colorTex, offset1.xy ).rgb;',
  		'	t = abs( C - Cright );',
  		'	delta.z = max( max( t.r, t.g ), t.b );',

  		'	vec3 Cbottom  = texture2D( colorTex, offset1.zw ).rgb;',
  		'	t = abs( C - Cbottom );',
  		'	delta.w = max( max( t.r, t.g ), t.b );',

  		// Calculate the maximum delta in the direct neighborhood:
  		'	float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );',

  		// Calculate left-left and top-top deltas:
  		'	vec3 Cleftleft  = texture2D( colorTex, offset2.xy ).rgb;',
  		'	t = abs( C - Cleftleft );',
  		'	delta.z = max( max( t.r, t.g ), t.b );',

  		'	vec3 Ctoptop = texture2D( colorTex, offset2.zw ).rgb;',
  		'	t = abs( C - Ctoptop );',
  		'	delta.w = max( max( t.r, t.g ), t.b );',

  		// Calculate the final maximum delta:
  		'	maxDelta = max( max( maxDelta, delta.z ), delta.w );',

  		// Local contrast adaptation in action:
  		'	edges.xy *= step( 0.5 * maxDelta, delta.xy );',

  		'	return vec4( edges, 0.0, 0.0 );',
  		'}',

  		'void main() {',

  		'	gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset0, vOffset1, vOffset2, tDiffuse );',

  		'}'

	].join( '\n' )

};

export default SMAAStage1;
