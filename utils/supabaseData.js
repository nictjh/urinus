import { supabase } from '../lib/supabase';

//future db crud functions should be placed here

const fetchCubicles = async (id) => {
    const { data, error } = await supabase
      .from('cubicle_trial')
      .select('*')
      .eq('toilet_uuid', id);
    if (error) {
      console.log("Error fetching cubicles: ", error);
    } else {
      return data;
    }
  }
export { fetchCubicles };