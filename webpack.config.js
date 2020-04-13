const path = require('path');

module.exports={
	mode:'development',
	entry:'./js/main.js',
	output:{
		path: path.resolve(__dirname,'dest'),
		filename: 'index.min.js'
	},
	//处理规则
	module:{
		rules:[
			{	
				test:/\.css$/i,
				use:[
					'style-loader',
					'css-loader',
					//'postcss-loader'
					{
						loader : 'postcss-loader',
						//代替webpack.config.js
						options : {
							plugins: [require('autoprefixer')]
						}
					}
				]
			},{
				test:/\.js$/i,
				use: 'babel-loader'
			},{
				test:/\.(jpg|png|gif)$/i,
				use:[{
					loader:'url-loader',
					options:{
						outputPath:'imgs/', //相对于上面的output.path
						publicPath:'dest/imgs',	   //输出到css的路径
						limit:8*1024		
					}
				}]
			},
		]
	}
}
