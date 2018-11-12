
import test from 'ava';
import { LocalWikiEntityHelper } from './local-wiki-entity-helper';


test('#getPartialName', t => {
    const name1 = 'Ministerul Educatiei';
    t.is(LocalWikiEntityHelper.getPartialName('Ministerul Educatiei (Romaniei)', 'ro', name1), name1, '(Romaniei)');
    t.is(LocalWikiEntityHelper.getPartialName('Ministerul Educatiei al Romaniei', 'ro', name1), name1, 'al Romaniei');
    t.is(LocalWikiEntityHelper.getPartialName('Ministerul Educatiei al Moldovei', 'ro', name1), name1, 'al Moldovei');
})

test('#getPartialName long partial', t => {
    const name1 = 'Ordinul Ștefan cel Mare (Republica Moldova)';
    t.is(LocalWikiEntityHelper.getPartialName(name1, 'ro', name1), 'Ordinul Ștefan cel Mare', '(Republica Moldova)');
    t.is(LocalWikiEntityHelper.getPartialName('Ștefan cel Mare (ordin)', 'ro', name1), null, 'Ștefan cel Mare (ordin)');
    t.is(LocalWikiEntityHelper.getPartialName('Ordinul Ștefan cel Mare și Sfânt (MD)', 'ro', name1), 'Ordinul Ștefan cel Mare și Sfânt', 'Ordinul Ștefan cel Mare și Sfânt');
})


