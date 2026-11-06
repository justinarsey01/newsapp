import {useEffect,useState} from 'react';
import {View,Text,FlatList,Pressable,ScrollView,Switch,Image,useWindowDimensions,Appearance,Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';import {createClient} from '@supabase/supabase-js';
import RenderHtml from 'react-native-render-html';import * as Notifications from 'expo-notifications';import * as Device from 'expo-device';
const sb=createClient(process.env.EXPO_PUBLIC_SUPABASE_URL,process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,{auth:{storage:AsyncStorage}});
export default function App(){
 const {width}=useWindowDimensions();
 const [items,setItems]=useState([]),[open,setOpen]=useState(null),[page,setPage]=useState('home'),[status,setStatus]=useState('');
 const [dark,setDark]=useState(Appearance.getColorScheme()==='dark'),[notif,setNotif]=useState(false),[maint,setMaint]=useState(false);
 const c=dark?{bg:'#14161a',fg:'#ececea',mut:'#9a9ea6',card:'#1c1f25'}:{bg:'#fbfaf7',fg:'#1b1d21',mut:'#6b6f76',card:'#fff'};
 useEffect(()=>{(async()=>{ // show saved stories instantly, then auto-download the latest for offline reading
  const cached=await AsyncStorage.getItem('articles');if(cached)setItems(JSON.parse(cached));
  const s=await AsyncStorage.getItem('prefs');if(s){const p=JSON.parse(s);setDark(p.dark);setNotif(p.notif)}
  setStatus('Updating…');
  const {data,error}=await sb.from('articles').select('id,title,slug,excerpt,content,cover_image_url,is_breaking,published_at')
   .eq('status','published').order('published_at',{ascending:false}).limit(100);
  if(error||!data)return setStatus(cached?'Offline: showing saved stories':'You are offline and have no saved stories yet');
  setItems(data);await AsyncStorage.setItem('articles',JSON.stringify(data));setStatus('Saved for offline reading');
  const m=await sb.from('app_settings').select('value').eq('key','maintenance').maybeSingle();setMaint(!!m.data?.value)})()},[]);
 const savePrefs=(d,n)=>AsyncStorage.setItem('prefs',JSON.stringify({dark:d,notif:n}));
 const toggleNotif=async v=>{setNotif(v);savePrefs(dark,v);
  if(v&&Device.isDevice){const p=await Notifications.requestPermissionsAsync();if(p.granted){const t=(await Notifications.getExpoPushTokenAsync()).data;
   await sb.rpc('register_token',{t,p:Platform.OS})}}};
 const T=p=>({color:c.fg,...p});
 if(maint)return <View style={{flex:1,backgroundColor:c.bg,justifyContent:'center',padding:24}}><Text style={T({fontSize:20})}>We are updating the app. Please check back soon.</Text></View>;
 return <View style={{flex:1,backgroundColor:c.bg,paddingTop:48}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',padding:12}}>
   <Pressable onPress={()=>{setOpen(null);setPage('home')}}><Text style={T({fontSize:20,fontWeight:'700'})}>The Daily</Text></Pressable>
   <Pressable onPress={()=>setPage(page==='settings'?'home':'settings')}><Text style={T()}>{page==='settings'?'Close':'Settings'}</Text></Pressable></View>
  {page==='settings'?<View style={{padding:16}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:16}}><Text style={T()}>Dark mode</Text><Switch value={dark} onValueChange={v=>{setDark(v);savePrefs(v,notif)}}/></View>
   <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={T()}>Breaking news notifications</Text><Switch value={notif} onValueChange={toggleNotif}/></View>
   <Text style={{color:c.mut,marginTop:24}}>{items.length} stories saved on this device</Text></View>
  :open?<ScrollView style={{padding:16}}><Pressable onPress={()=>setOpen(null)}><Text style={T()}>Back</Text></Pressable>
   <Text style={T({fontSize:26,fontWeight:'700',marginVertical:12})}>{open.title}</Text>
   {open.cover_image_url&&<Image source={{uri:open.cover_image_url}} style={{width:'100%',height:200}}/>}
   <RenderHtml contentWidth={width-32} source={{html:open.content}} baseStyle={{color:c.fg,fontSize:17}}/></ScrollView>
  :<><Text style={{color:c.mut,paddingHorizontal:12}}>{status}</Text>
   <FlatList data={items} keyExtractor={i=>String(i.id)} renderItem={({item})=><Pressable onPress={()=>setOpen(item)}
    style={{backgroundColor:c.card,margin:10,padding:14,borderRadius:8}}>
    {item.is_breaking&&<Text style={{color:'#c0392b',fontWeight:'700'}}>Breaking</Text>}
    <Text style={T({fontSize:18,fontWeight:'600'})}>{item.title}</Text><Text style={{color:c.mut}}>{item.excerpt}</Text></Pressable>}/></>}</View>}
