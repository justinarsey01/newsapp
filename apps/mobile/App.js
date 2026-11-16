import 'react-native-url-polyfill/auto';
import {useCallback,useEffect,useState} from 'react';
import {Alert,BackHandler,FlatList,Platform,Pressable,RefreshControl,ScrollView,Share,Switch,Text,TextInput,View,useColorScheme,useWindowDimensions} from 'react-native';
import {StatusBar} from 'expo-status-bar';import {Image} from 'expo-image';import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';import {createClient} from '@supabase/supabase-js';
import RenderHtml from 'react-native-render-html';import * as Notifications from 'expo-notifications';import * as Device from 'expo-device';import * as Updates from 'expo-updates';
const G='#0a7a3d',SITE=process.env.EXPO_PUBLIC_SITE_URL||'';
const sb=createClient(process.env.EXPO_PUBLIC_SUPABASE_URL,process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,{auth:{storage:AsyncStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowAlert:true,shouldPlaySound:true,shouldSetBadge:false})});
const ago=d=>{const s=(Date.now()-new Date(d))/1000;return s<3600?Math.max(1,Math.floor(s/60))+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'};
const frame={borderWidth:2,borderColor:G,borderRadius:14,overflow:'hidden'};

function Row({a,c,onPress}){return <Pressable onPress={onPress} style={{flexDirection:'row',gap:12,paddingVertical:10,borderBottomWidth:1,borderColor:c.bd}}>
 {a.cover_image_url?<Image source={{uri:a.cover_image_url}} cachePolicy="disk" contentFit="cover" style={{width:96,height:80,...frame}}/>:null}
 <View style={{flex:1}}><Text style={{color:G,fontSize:12,fontWeight:'700'}}>{(a.categories?.name||'').toUpperCase()} <Text style={{color:c.mut,fontWeight:'400'}}>{ago(a.published_at)}</Text>{a.is_sponsored?'  SPONSORED':''}</Text>
  <Text style={{color:c.fg,fontSize:16,fontWeight:'600',marginTop:3}} numberOfLines={3}>{a.title}</Text></View></Pressable>}

function Lead({a,onPress}){return <Pressable onPress={onPress} style={{height:240,marginVertical:10,backgroundColor:G,...frame,borderRadius:20}}>
 {a.cover_image_url&&<Image source={{uri:a.cover_image_url}} cachePolicy="disk" contentFit="cover" style={{position:'absolute',top:0,left:0,right:0,bottom:0}}/>}
 <View style={{position:'absolute',left:0,right:0,bottom:0,padding:14,paddingTop:50,backgroundColor:'rgba(0,0,0,.6)'}}>
  <Text style={{color:'#fff',fontSize:12,fontWeight:'700'}}>{a.is_breaking?'BREAKING  ':''}{(a.categories?.name||'').toUpperCase()}</Text>
  <Text style={{color:'#fff',fontSize:21,fontWeight:'700'}} numberOfLines={3}>{a.title}</Text></View></Pressable>}

function Reader({a,c,size,isSaved,onSave,onBack}){
 const {width}=useWindowDimensions(),W=width-32;
 const renderers={img:({tnode})=>{const pair=tnode.parent?.hasClass?.('pair');
  return <Image source={{uri:tnode.attributes.src}} cachePolicy="disk" contentFit="cover" style={{width:pair?W/2-2:W,height:pair?150:W*0.62,borderRadius:pair?0:14,marginVertical:pair?0:8}}/>}};
 return <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:40}}>
  <Pressable onPress={onBack}><Text style={{color:G,fontWeight:'700',fontSize:16}}>← Back</Text></Pressable>
  <Text style={{color:c.fg,fontSize:26,fontWeight:'800',marginTop:12}}>{a.title}</Text>
  <Text style={{color:c.mut,marginVertical:6}}>{a.categories?.name} · {ago(a.published_at)}</Text>
  {a.cover_image_url&&<Image source={{uri:a.cover_image_url}} cachePolicy="disk" contentFit="cover" style={{width:W,height:W*0.62,...frame,marginVertical:8}}/>}
  <View style={{flexDirection:'row',gap:10,marginVertical:8}}>
   <Pressable onPress={onSave} style={{borderWidth:1,borderColor:G,borderRadius:20,paddingHorizontal:16,paddingVertical:8}}><Text style={{color:G,fontWeight:'700'}}>{isSaved?'Saved ✓':'Save'}</Text></Pressable>
   <Pressable onPress={()=>Share.share({message:`${a.title} ${SITE}/article/${a.slug}`})} style={{backgroundColor:G,borderRadius:20,paddingHorizontal:16,paddingVertical:8}}><Text style={{color:'#fff',fontWeight:'700'}}>Share</Text></Pressable></View>
  <RenderHtml contentWidth={W} source={{html:a.content||''}} renderers={renderers} baseStyle={{color:c.fg,fontSize:size,lineHeight:size*1.6}}
   classesStyles={{pair:{flexDirection:'row',borderWidth:2,borderColor:G,borderRadius:16,overflow:'hidden',marginVertical:12}}}
   tagsStyles={{a:{color:G},blockquote:{borderLeftWidth:3,borderColor:G,paddingLeft:12,marginLeft:0}}}/></ScrollView>}

export default function App(){
 const sys=useColorScheme();
 const [arts,setArts]=useState([]),[cats,setCats]=useState([]),[tab,setTab]=useState('home'),[cat,setCat]=useState(null),[open,setOpen]=useState(null),
  [saved,setSaved]=useState([]),[prefs,setPrefs]=useState({theme:'system',notif:false,size:17}),[status,setStatus]=useState(''),[maint,setMaint]=useState(false),
  [q,setQ]=useState(''),[busy,setBusy]=useState(false),[pending,setPending]=useState(null),[upd,setUpd]=useState(false);
 const dark=prefs.theme==='dark'||(prefs.theme==='system'&&sys==='dark');
 const c=dark?{bg:'#0f1311',fg:'#ecefec',mut:'#98a09a',card:'#181d1a',bd:'#2a312c'}:{bg:'#f6faf6',fg:'#111',mut:'#5f6670',card:'#fff',bd:'#e1e6e1'};
 const savePrefs=p=>{setPrefs(p);AsyncStorage.setItem('prefs',JSON.stringify(p))};
 const sync=useCallback(async()=>{setBusy(true);setStatus('Updating…');
  const [a,k]=await Promise.all([sb.from('articles').select('id,title,slug,excerpt,content,cover_image_url,is_breaking,is_sponsored,published_at,categories(name,slug)')
   .eq('status','published').order('published_at',{ascending:false}).limit(100),sb.from('categories').select('name,slug').order('name')]);
  setBusy(false);if(a.error||!a.data)return setStatus('Offline: showing saved stories');
  setArts(a.data);setCats(k.data||[]);await AsyncStorage.multiSet([['arts',JSON.stringify(a.data)],['cats',JSON.stringify(k.data||[])]]);
  setStatus('Saved for offline reading · '+new Date().toLocaleTimeString());
  const urls=[];a.data.slice(0,40).forEach(x=>{x.cover_image_url&&urls.push(x.cover_image_url);for(const m of (x.content||'').matchAll(/<img[^>]+src="([^"]+)"/g))urls.push(m[1])});
  Image.prefetch([...new Set(urls)],'disk').catch(()=>{});
  const m=await sb.from('app_settings').select('value').eq('key','maintenance').maybeSingle();setMaint(!!m.data?.value)},[]);
 useEffect(()=>{(async()=>{const r=await AsyncStorage.multiGet(['arts','cats','prefs','saved']);
  if(r[0][1])setArts(JSON.parse(r[0][1]));if(r[1][1])setCats(JSON.parse(r[1][1]));if(r[2][1])setPrefs(p=>({...p,...JSON.parse(r[2][1])}));if(r[3][1])setSaved(JSON.parse(r[3][1]));
  sync();const last=await Notifications.getLastNotificationResponseAsync();const u=last?.notification.request.content.data?.url;if(u?.startsWith('/article/'))setPending(decodeURIComponent(u.slice(9)))})();
  const sub=Notifications.addNotificationResponseReceivedListener(r=>{const u=r.notification.request.content.data?.url;if(u?.startsWith('/article/'))setPending(decodeURIComponent(u.slice(9)))});
  return()=>sub.remove()},[]);
 useEffect(()=>{if(__DEV__)return;Updates.checkForUpdateAsync().then(async r=>{if(r.isAvailable){await Updates.fetchUpdateAsync();setUpd(true)}}).catch(()=>{})},[]);
 useEffect(()=>{if(pending&&arts.length){const a=arts.find(x=>x.slug===pending);if(a){setOpen(a);setPending(null)}}},[pending,arts]);
 useEffect(()=>{const h=BackHandler.addEventListener('hardwareBackPress',()=>{if(open){setOpen(null);return true}if(tab!=='home'){setTab('home');return true}return false});return()=>h.remove()},[open,tab]);
 const toggleSave=a=>{const n=saved.includes(a.id)?saved.filter(x=>x!==a.id):[...saved,a.id];setSaved(n);AsyncStorage.setItem('saved',JSON.stringify(n))};
 const toggleNotif=async v=>{if(v){if(!Device.isDevice)return Alert.alert('Notifications need a real phone');
   if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('default',{name:'News',importance:Notifications.AndroidImportance.HIGH});
   const p=await Notifications.requestPermissionsAsync();if(!p.granted)return Alert.alert('Notifications are blocked','Allow them in your phone settings.');
   try{const t=(await Notifications.getExpoPushTokenAsync({projectId:Constants.expoConfig?.extra?.eas?.projectId})).data;await sb.rpc('register_token',{t,p:Platform.OS})}
   catch(e){return Alert.alert('Could not turn on notifications',String(e.message||e))}}
  savePrefs({...prefs,notif:v})};
 const list=cat?arts.filter(a=>a.categories?.slug===cat):arts;
 const T=(p={})=>({color:c.fg,...p});
 if(maint)return <View style={{flex:1,backgroundColor:c.bg,justifyContent:'center',padding:24}}><Text style={T({fontSize:20})}>We are updating the app. Please check back soon.</Text></View>;
 const Btn=({on,label,onPress})=><Pressable onPress={onPress} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:20,backgroundColor:on?G:c.card,borderWidth:1,borderColor:on?G:c.bd,marginRight:8}}><Text style={{color:on?'#fff':c.fg,fontWeight:'600'}}>{label}</Text></Pressable>;
 let body;
 if(open)body=<Reader a={open} c={c} size={prefs.size} isSaved={saved.includes(open.id)} onSave={()=>toggleSave(open)} onBack={()=>setOpen(null)}/>;
 else if(tab==='home')body=<FlatList data={cat?list:list.slice(1)} keyExtractor={i=>String(i.id)} contentContainerStyle={{paddingHorizontal:16,paddingBottom:20}} refreshControl={<RefreshControl refreshing={busy} onRefresh={sync} tintColor={G}/>}
  ListHeaderComponent={<View><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:8}}><Btn on={!cat} label="Latest" onPress={()=>setCat(null)}/>{cats.map(k=><Btn key={k.slug} on={cat===k.slug} label={k.name} onPress={()=>setCat(k.slug)}/>)}</ScrollView>
   <Text style={{color:c.mut,fontSize:12}}>{status}</Text>{!cat&&list[0]&&<Lead a={list[0]} onPress={()=>setOpen(list[0])}/>}</View>}
  ListEmptyComponent={<Text style={{color:c.mut,marginTop:30,textAlign:'center'}}>No stories yet. Pull down to refresh.</Text>} renderItem={({item})=><Row a={item} c={c} onPress={()=>setOpen(item)}/>}/>;
 else if(tab==='search'){const f=q.trim()?arts.filter(a=>(a.title+' '+(a.excerpt||'')).toLowerCase().includes(q.trim().toLowerCase())):[];
  body=<View style={{flex:1,padding:16}}><TextInput value={q} onChangeText={setQ} placeholder="Search saved news" placeholderTextColor={c.mut} style={{backgroundColor:c.card,color:c.fg,borderWidth:1,borderColor:c.bd,borderRadius:12,padding:12,fontSize:16}}/>
   <FlatList data={f} keyExtractor={i=>String(i.id)} renderItem={({item})=><Row a={item} c={c} onPress={()=>setOpen(item)}/>} ListEmptyComponent={<Text style={{color:c.mut,marginTop:20}}>{q?'No matches.':'Type to search. Works offline.'}</Text>}/></View>}
 else if(tab==='saved'){const f=arts.filter(a=>saved.includes(a.id));body=<FlatList style={{padding:16}} data={f} keyExtractor={i=>String(i.id)} renderItem={({item})=><Row a={item} c={c} onPress={()=>setOpen(item)}/>} ListEmptyComponent={<Text style={{color:c.mut,marginTop:20}}>Stories you save appear here.</Text>}/>}
 else body=<ScrollView style={{padding:16}}>
  <Text style={T({fontWeight:'700',marginBottom:8})}>Appearance</Text><View style={{flexDirection:'row'}}>{['system','light','dark'].map(t=><Btn key={t} on={prefs.theme===t} label={t[0].toUpperCase()+t.slice(1)} onPress={()=>savePrefs({...prefs,theme:t})}/>)}</View>
  <Text style={T({fontWeight:'700',marginTop:22,marginBottom:8})}>Text size</Text><View style={{flexDirection:'row'}}>{[[15,'Small'],[17,'Medium'],[20,'Large']].map(([s,l])=><Btn key={s} on={prefs.size===s} label={l} onPress={()=>savePrefs({...prefs,size:s})}/>)}</View>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:22}}><Text style={T({fontSize:16})}>Breaking news notifications</Text><Switch value={prefs.notif} onValueChange={toggleNotif} trackColor={{true:G}}/></View>
  <Text style={{color:c.mut,marginTop:22}}>{arts.length} stories saved on this phone</Text>
  <Pressable onPress={sync} style={{marginTop:14}}><Text style={{color:G,fontWeight:'700'}}>Download latest news now</Text></Pressable>
  <Pressable onPress={async()=>{await AsyncStorage.multiRemove(['arts','cats']);setArts([]);setCats([]);await Image.clearDiskCache()}} style={{marginTop:14}}><Text style={{color:'#c0392b',fontWeight:'700'}}>Clear downloaded news</Text></Pressable></ScrollView>;
 const tabs=[['home','Home'],['search','Search'],['saved','Saved'],['settings','Settings']];
 return <View style={{flex:1,backgroundColor:c.bg,paddingTop:Constants.statusBarHeight}}><StatusBar style={dark?'light':'dark'}/>
  {upd&&<Pressable onPress={()=>Updates.reloadAsync()} style={{backgroundColor:G,padding:10}}><Text style={{color:'#fff',textAlign:'center',fontWeight:'700'}}>New update ready. Tap to restart.</Text></Pressable>}
  {!open&&<View style={{paddingHorizontal:16,paddingVertical:8}}><Text style={{fontSize:26,fontWeight:'800',color:G}}>The<Text style={{color:'#8bc53f'}}>Daily</Text></Text></View>}
  <View style={{flex:1}}>{body}</View>
  {!open&&<View style={{flexDirection:'row',borderTopWidth:1,borderColor:c.bd,backgroundColor:c.card}}>{tabs.map(([k,l])=><Pressable key={k} onPress={()=>setTab(k)} style={{flex:1,alignItems:'center',paddingVertical:14}}>
   <Text style={{color:tab===k?G:c.mut,fontWeight:tab===k?'800':'500'}}>{l}</Text></Pressable>)}</View>}</View>}
