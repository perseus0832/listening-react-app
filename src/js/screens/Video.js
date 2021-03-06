// screens/Video.js
import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col, ButtonGroup, Button} from 'react-bootstrap';
import Transcript from '../lib/Transcript'
import UserAnswer from '../lib/UserAnswer'
import Progress from '../lib/Progress'

//const TIME = [{start: 3, end: 10}, {start: 14, end: 19}, {start: 22, end: 28}]

export default class WatchVideo extends Component {

    home(){
        this.props.history.push({pathname:'/'});
    }

    constructor(props) {
        super(props);
        this.playTextObj = {true: 'Play/Replay' , false: 'Pause'}; 

        this.state = {
            play: false,
            initial: true, 
            playText: this.playTextObj.true,
            scriptIndex: this.IdxProcess,
            endTime: null,
            startTime: null,
            duration: null,
            save: false,
            match: 0

        }
        this.player = React.createRef();
        this.script = null;
        this.transcript = new Transcript(this.props.location.state.video_id);
        this.IdxProcess = 0;

        console.log(this.props);
    }
    componentWillMount() {
        this.transcript.fetchTranscriptData().then((script) => {
            console.log(script)
            if(script.length){
                this.script = script;
                this.setState({endTime: this.script[this.IdxProcess].timeline.end})
            }else{
                this.home()
            }
            
        });
    }
    componentDidMount(){console.log(this.player.current.player)}
    handleOnPlay(){
        //Only play the video func
        this.setState({
            playText: this.playTextObj[this.state.play] , 
            play: !this.state.play,
        })
    }
    trackingOnPlay(){
        var current = this.player.current.getCurrentTime();
        //console.log(current + ' - ' + this.state.endTime)
        //console.log(this.props)
        if(this.state.play){
            if(current === this.state.endTime || current > this.state.endTime){
                this.handleOnPlay()
            }
        }        
    }
    checkingSave(bool, percent){
        this.setState({save: bool})
        if(percent){
            this.setState({match: percent})
            this.progress.setScore(percent)
            console.log(percent)
        }
    }
    clearAnsw(){
        console.log('clearing')
        this.answ.clear();
    }
    goToTrack(skip){
        if(skip){
            this.IdxProcess++;
            this.progress.setProgress(this.IdxProcess, this.script.length);
            this.progress.setMaxScore(this.IdxProcess + 1)
            if(this.IdxProcess > this.script.length - 1)this.IdxProcess = 0;
            var timeline = this.script[this.IdxProcess].timeline
            this.answ.setLine(this.script[this.IdxProcess].text)
            console.log(timeline)
            this.setState({
                scriptIndex: this.IdxProcess,
                endTime: timeline.end,
                startTime: timeline.start
            })
            console.log(this.state.scriptIndex + ' _ ' + timeline.start + ' - ' + timeline.end)
        }else{
            console.log(this.state.endTime)
            if(this.state.initial){
                this.player.current.seekTo(0)
                
                this.answ.setLine(this.script[0].text)
                this.progress.setMaxScore(this.IdxProcess + 1)
                this.setState({initial: false, startTime: this.script[0].timeline.start})
            }else{this.player.current.seekTo(this.state.startTime)}
            
        }
        this.checkingSave(false)
        this.clearAnsw(this)
        this.answ.setWordCount()
        
        if(!this.state.play)this.handleOnPlay(); 
        
    }
    render(){
        return (
            <Col>
                <Progress ref={progress => this.progress = progress }/>
                <Row className='video'>
                    <div className='overlay'>
                        <ReactPlayer
                            ref={this.player}
                            url={'https://www.youtube.com/embed/'+ 
                            this.props.location.state.video_id+'&iv_load_policy=3'}
                            config={{
                                youtube: {
                                    playerVars: {rel: 0, showinfo: 0, iv_load_policy: 3}
                                },
                            }}
                            controls={false}
                            progressInterval={33}
                            onProgress={() => this.trackingOnPlay()}
                            onStart={() => {this.setState({trackingCheck: true})}}
                            className='react-player' 
                            playing={this.state.play}
                        />
                    </div>
                </Row>

                <Row>
                    <Col> 
                        <ButtonGroup aria-label="Basic example">
                            <Button variant="secondary" disabled={this.state.play || this.state.save}
                                onClick={() => this.goToTrack(false)}>
                                {this.state.playText}
                            </Button>
                            <Button variant="secondary" disabled={!this.state.save}
                                onClick={() => this.goToTrack(true)}>
                                Next
                            </Button>
                        </ButtonGroup>
                    </Col>         
                </Row>
                <Row>
                    <UserAnswer ref={answ => this.answ = answ } 
                    saveHandler={this.checkingSave.bind(this)} 
                    initial={this.state.initial}
                    save={this.state.save} 
                    match={this.state.match} />
                </Row>         
            </Col>
        );
    }
}