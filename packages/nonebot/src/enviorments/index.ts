import {Context, segment} from 'koishi'
import {RegexDecorator} from './decorators/regex'
import {NoneBotContainer} from '../container'

export default class NoneBotEnvironment{
  constructor(protected ctx:Context,protected container:NoneBotContainer) {

  }
  get_driver(){
    return {config:{dict:()=>new Map()}}
  }
  on_regex(regex){
    return new RegexDecorator(this.ctx,this.container,new RegExp(regex))
  }

  typing = {
    T_State:function(){}
  }
  adapters={
    onebot:{
      v11:{
        Bot:function(){},
        Event:function(){},
        Message:{},
        MessageSegment:{

          image:(t)=>segment.image(t)
        }
      }
    }
  }
  params={
    T_State:function(){console.info('TRS#0');return {T_State:{}}},
    State:function(){console.info('TRS#1');return {T_State:{}}}
  }
}
