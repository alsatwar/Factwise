import React, { Component } from 'react';
import { Router, Route, hashHistory } from 'react-router';

import './App.css';
import New from './New';
import List from './List';
import LeftItems from './LeftItems';
import ListSelector from './ListSelector';
import GlobalAction from './GlobalAction';
import Alert from './Alert';
import { storeGet, storeSave } from './Store';
import { Search } from './Seach';

//Func for display all items
const filterAll = function () {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <List items={Search(this.state.items, this.state.search)} type="all" context={this} />
        <Alert value={this.state.alert.value} visible={this.state.alert.visible}
          context={this} type={this.state.alert.type} />
      </div>

      <div className="panel-footer">
        <LeftItems value={this.state.leftCount} />
        <ListSelector active="all" />
        <GlobalAction context={this} />
      </div>
    </div >
  )
}

//Func for display only active items
const filterActive = function () {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <List items={Search(this.state.items, this.state.search)} type="active" context={this} />
        <Alert value={this.state.alert.value} visible={this.state.alert.visible}
          context={this} type={this.state.alert.type} />
      </div>

      <div className="panel-footer">
        <LeftItems value={this.state.leftCount} />
        <ListSelector active="active" />
        <GlobalAction context={this} />
      </div>
    </div >
  )
}

//Func for display only completed items
const filterCompleted = function () {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <List items={Search(this.state.items, this.state.search)} type="completed" context={this} />
        <Alert value={this.state.alert.value} visible={this.state.alert.visible}
          context={this} type={this.state.alert.type} />
      </div>

      <div className="panel-footer">
        <LeftItems value={this.state.leftCount} />
        <ListSelector active="completed" />
        <GlobalAction context={this} />
      </div>
    </div >
  )
}

//"Generate" key for Router
let reloadCounter = 0;

/* App */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      active: 'all',
      items: storeGet() === null ? [] : storeGet(),
      leftCount: this.countLeft(storeGet()),
      alert: {
        value: '',
        visible: false,
        type: "error"
      }
    }

    this.deleteCompleted = this.deleteCompleted.bind(this);
    this.checkAll = this.checkAll.bind(this);
  }

  //Return counter of active items
  countLeft(items) {
    let count = 0;
    if (items === undefined || items === null) {
      count = 0;
    } else {
      for (let i = 0; i < items.length; i++) {
        if (!items[i].checked) {
          count++;
        }
      }
    }
    return count;
  }

  //Add item func
  handleAdd(item) {
    function listItem(num, text) {
      return {
        id: num,
        value: text,
        checked: false
      }
    }

    if (item.length === 0) {
      this.alert("Empty value for item!", true, "error");
    } else {
      let newId = 0;
      let itemsList = this.state.items;
      if (itemsList[itemsList.length - 1] !== undefined) {
        newId = itemsList[itemsList.length - 1].id + 1
      } else {
        newId = 1;
      }
      var newItem = new listItem(newId, item);
      itemsList.push(newItem);
      this.setState({ items: itemsList });
      this.setState(({ leftCount: this.countLeft(itemsList) }));
      this.setState({ search: '' });
      storeSave(this.state.items);
      reloadCounter++;
    }
  }

  //Search func
  handleSearch(text) {
    this.setState({ search: text });
    reloadCounter++;
  }

  //Check item func
  checkItem(id) {
    let itemsList = this.state.items;
    for (let i = 0; i < itemsList.length; i++) {
      if (itemsList[i].id === id) {
        itemsList[i].checked = !itemsList[i].checked;
      }
    }
    this.setState({ search: this.state.search });
    this.setState({ items: itemsList });
    this.setState(({ leftCount: this.countLeft(this.state.items) }));
    storeSave(this.state.items);
    reloadCounter++;
  }

  //Delete item func
  deleteItem(id) {
    let itemsList = this.state.items;
    for (let i = 0; i < itemsList.length; i++) {
      if (itemsList[i].id === id) {
        itemsList.splice(i, 1);
      }
    }
    this.setState({ search: this.state.search });
    this.setState({ items: itemsList });
    this.setState(({ leftCount: this.countLeft(this.state.items) }));
    this.alert("Item was deleted!", true, "success");
    storeSave(this.state.items);
    reloadCounter++;
  }

  //Rename item func
  editItem(id, value) {
    if (value.length === 0) {
      this.alert("Empty value for item!", true, "error");
    } else {
      let itemsList = this.state.items;
      for (let i = 0; i < itemsList.length; i++) {
        if (itemsList[i].id === id) {
          itemsList[i].value = value;
        }
      }
      this.setState({ search: this.state.search });
      this.setState({ items: itemsList });
      storeSave(this.state.items);
      reloadCounter++;
    }
  }

  //Alerts for user
  alert(value, visible, type) {
    this.setState({ alert: { value: value, visible: visible, type: type } });
    var context = this;

    //Hide alert for 1.5 sec
    function hideAlert() {
      reloadCounter++;
      context.setState({ alert: { value: "", visible: false, type: "type" } });
      reloadCounter++;
    }
    setTimeout(function () {
      hideAlert();
    }, 1500);

    reloadCounter++;
  }

  //Delete completed items func
  deleteCompleted() {
    let itemsList = this.state.items;
    for (let i = 0; i < itemsList.length; i++) {
      if (itemsList[i].checked) {
        itemsList.splice(i, 1);
        i -= 1;
      }
    }
    this.setState({ items: itemsList });
    this.setState(({ leftCount: this.countLeft(itemsList) }));
    this.setState({ search: '' });
    storeSave(this.state.items);
    this.alert("Completed items were deleted!", true, "success");
    reloadCounter++;
  }

  //Func for check all items
  checkAll() {
    let itemsList = this.state.items;
    for (let i = 0; i < itemsList.length; i++) {
      itemsList[i].checked = true;
    }

    this.setState({ items: itemsList });
    this.setState(({ leftCount: this.countLeft(itemsList) }));
    this.setState({ search: '' });
    this.alert("All items were checked!", true, "success");
    storeSave(this.state.items);
    reloadCounter++;
  }

  render() {
    return (
      <section>
        <h1>ToDo List</h1>
        <New context={this} value={this.state.search} />
        <Router history={hashHistory} key={reloadCounter}>
          <Route path="/" component={filterAll.bind(this)} />
          <Route path="/active" component={filterActive.bind(this)} />
          <Route path="/completed" component={filterCompleted.bind(this)} />
        </Router>
      </section>
    )
  }

}

export default App;