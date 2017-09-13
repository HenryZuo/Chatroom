import React from 'react';
import ReactDOM from 'react-dom';
import { Collection, CollectionItem } from 'react-materialize';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: io(),
      // YOUR CODE HERE (1)
      roomName: "Party Place",
      username: "",
      rooms: ["Party Place","Madison Square Garden","Oracle Center"]
    };

    this.join = this.join.bind(this);
    this.onSwitch = this.onSwitch.bind(this);
  }

  componentDidMount() {
    // WebSockets Receiving Event Handlers
    this.state.socket.on('connect', () => {
      console.log('connected');
      // YOUR CODE HERE (2)
      var username = prompt("You User Name: ")
      this.setState({username: username});
      this.state.socket.emit('username',username);
      this.state.socket.emit('room',this.state.roomName);
    });
    this.state.socket.on('errorMessage', message => {
      // YOUR CODE HERE (3)
      alert(message);
    });
  }

  onSwitch(room){
    this.join(room);
  }

  join(room) {
    console.log("Joined room",room);
    this.setState({roomName: room});
    this.state.socket.emit('room',room);
  }

  render() {
    return (
      <div>
        <h3>Chatroom</h3>
        <ChatRoomSelector rooms={this.state.rooms} roomName={this.state.roomName} onSwitch={this.onSwitch}/>
        <Chatroom socket={this.state.socket} roomName={this.state.roomName} username={this.state.username} />
      </div>
    )
  }
}

class ChatRoomSelector extends React.Component {
  constructor(props){
    super(props)
  }
  render() {
    return (
      <div>
      <Collection className="nav nav-pills">
        {this.props.rooms.map((item)=>{
          if(item===this.props.roomName){
            return (<CollectionItem roleName="presentation" className="active" onClick={()=>{this.props.onSwitch(item)}}>
              {item}
          </CollectionItem>)
          }
          else{
            return (<CollectionItem roleName="presentation" onClick={()=>{this.props.onSwitch(item)}}>
              {item}
          </CollectionItem>)
          }
        }
        )}
      </Collection>
    </div>
    )
  }
}

class Chatroom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      messages: []
    };
    this.clearMessage = this.clearMessage.bind(this)
    this.updateMessage = this.updateMessage.bind(this)
  }

  componentDidMount(){
    this.props.socket.on('message',(data) => {
      var newArr = [...this.state.messages,data.username+': '+data.content];
      this.setState({messages: newArr});
    })
  }

  componentWillReceiveProps(nextProps){
    if (this.props.roomName !== nextProps.roomName){
      this.setState({messages: []})
    }
  }

  clearMessage(e){
    e.preventDefault();
    this.props.socket.emit('message',this.state.message);
    var newArr = [...this.state.messages,this.props.username+': '+this.state.message];
    this.setState({messages: newArr});
    this.setState({message: ''});
  }

  updateMessage(event){
    this.setState({message: event.target.value})
  }

  render(){
    return (
    <div>
  <h5> Welcome to {this.props.roomName}, {this.props.username}! </h5>
      <form onSubmit={this.clearMessage}>
        <input type="text" onChange={this.updateMessage} value={this.state.message}/>
        <input type="submit" value="Send"/>
      </form>
    <ul>
      {this.state.messages.map((item)=>
        <li>
          {item}
        </li>
      )}
    </ul>

  </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
