# Scene search video player

This project was created based on [This repo](https://github.com/gyuilLim/youtube-scene-search-with-text)

This project is a text-based scene search video player designed to enhance video navigation and retrieval. By inputting a description or keywords, users can quickly locate specific scenes within a video. The system leverages advanced and video analysis process.


## System Process

![image](https://github.com/user-attachments/assets/6727fe58-0014-4473-a6eb-ea6f951aae8d)


## Set up


Deep learning models are used in this tool.

Models : CLIP, BLIP-2

So I recommend you to install the following command for setting an environment.


```
$ git clone https://github.com/gyuilLim/Scene-search-video-player
$ conda create -n scene_search_video_player python=3.8
$ conda install --file requirements.txt
````

## Running 

Change directory '/Scene_search_video_player' and run this command.

```
$ flask run
```

## Result

### 1. This is initial screen of video player

![Screenshot from 2024-12-03 12-55-26](https://github.com/user-attachments/assets/ee3e213a-81a6-4c58-a57b-ed170b9e64fa)


### 2. If you drag&drop your video and search the scene you want, then

![Screenshot from 2024-12-03 13-08-49](https://github.com/user-attachments/assets/285aca72-7cff-44c3-8d95-171dbbcdde1a)

### 3. Three scenes similar to your text will be provided.




## Evaluation(GPT Evaluation - Hit rate)

|Hit threshold|Video1(%)|Video2(%)|Video3(%)|Video4(%)|Video5(%)|AVG|
|:-------------:|:---------:|:---------:|:---------:|:---------:|:---------:|:------:|
|0.6|95|100|100|100|100|99|
|0.7|40|90|100|85.71|85|80.142|
|0.8|0|20|30|28.57|10|17.147|
|AVG|45|70|77|71.43|65|65.67|

##
Refer to [this blog](https://mvcv.tistory.com/19) for troubleshooting. (ex. youtube-dl, pytube, like_count OSError)
