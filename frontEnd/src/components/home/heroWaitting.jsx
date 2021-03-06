import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

import HeroWaittingItem from './heroWaittingItem';

@inject('homeStore')
@observer
export default class HeroWaitting extends Component {

  constructor(props) {
    super(props);
    this.homeStore = props.homeStore.default;
  }

  render() {
    const { heroWaitting } = this.homeStore;

    const generateWaitting = () => {
      return _.map(heroWaitting, (item, index) => {
        return (<HeroWaittingItem index={index} hero={item} key={`Waitting${index}`}/>);
      })
    }

    return (
      <div className="hero-waitting">
        {generateWaitting()}
      </div>
    )
  }
}