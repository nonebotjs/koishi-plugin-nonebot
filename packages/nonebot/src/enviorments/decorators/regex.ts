import {Context} from 'koishi'
import {NoneBotContainer} from '../../container'
import {MessageEvent} from '../events/message'

export class RegexDecorator{
  constructor(protected ctx:Context,protected container:NoneBotContainer,protected regexp:RegExp) {}
  handle(){
    return (fn)=>{
      const newFn = fn.toJs() //@TODO:GC
      this.ctx.middleware((session, next)=>{
        if(session.content.search(this.regexp)>=0){
          try{
            newFn({send:async (p)=>{
              await session.send(p.message)
              }},new MessageEvent(session.content))
          }catch(e){
            console.error(e)
          }
          return
        }
        return next()
      })
    }
  }
}
